import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { apiKeyRepository } from "../src/repositories/apiKey.repository";
import { WorkspaceRole, ApiKeyPermission } from "@prisma/client";

jest.mock("../src/repositories/workspace.repository");
jest.mock("../src/repositories/apiKey.repository");

describe("Phase 3 Workspace & API Key Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-999";
  const workspaceId = "ws-uuid-888";
  const token = generateAccessToken({ userId, email: "owner@example.com", role: "DEVELOPER" });

  const mockWorkspace = {
    id: workspaceId,
    name: "Acme AI Corp",
    slug: "acme-ai-corp-123456",
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [
      {
        id: "mem-1",
        workspaceId,
        userId,
        role: WorkspaceRole.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: userId, name: "Owner", email: "owner@example.com", avatarUrl: null },
      },
    ],
    _count: { members: 1 },
  };

  const mockApiKey = {
    id: "key-uuid-1",
    name: "Production Agent Key",
    keyPrefix: "ag_live_12345678",
    keyHash: "dummyhash",
    workspaceId,
    createdById: userId,
    permissions: [ApiKeyPermission.READ, ApiKeyPermission.WRITE],
    lastUsedAt: null,
    expiresAt: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces should create a new workspace", async () => {
    (workspaceRepository.createWorkspace as jest.Mock).mockResolvedValue(mockWorkspace);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Acme AI Corp" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.workspace.name).toBe("Acme AI Corp");
  });

  it("GET /api/v1/workspaces should list user's workspaces", async () => {
    (workspaceRepository.findWorkspacesByUserId as jest.Mock).mockResolvedValue([mockWorkspace]);

    const res = await request(app)
      .get("/api/v1/workspaces")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.workspaces).toHaveLength(1);
    expect(res.body.data.workspaces[0].memberRole).toBe("OWNER");
  });

  it("POST /api/v1/workspaces/:id/api-keys should generate secret API Key", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.OWNER,
    });
    (apiKeyRepository.createApiKey as jest.Mock).mockResolvedValue(mockApiKey);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/api-keys`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Production Agent Key", permissions: ["READ", "WRITE"] });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.apiKey).toHaveProperty("secretKey");
    expect(res.body.data.apiKey.secretKey).toContain("ag_live_");
  });

  it("GET /api/v1/workspaces/:id/api-keys should list workspace API keys", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.OWNER,
    });
    (apiKeyRepository.findApiKeysByWorkspaceId as jest.Mock).mockResolvedValue([mockApiKey]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/api-keys`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.apiKeys).toHaveLength(1);
    expect(res.body.data.apiKeys[0].keyPrefix).toBe("ag_live_12345678");
  });

  it("DELETE /api/v1/workspaces/:id/api-keys/:keyId should revoke API Key", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.OWNER,
    });
    (apiKeyRepository.deleteApiKey as jest.Mock).mockResolvedValue({ count: 1 });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/v1/workspaces/${workspaceId}/api-keys/key-uuid-1`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
