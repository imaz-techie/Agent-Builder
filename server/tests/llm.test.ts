import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { llmProviderRepository } from "../src/repositories/llmProvider.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { LlmModel, ProviderType, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/llmProvider.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 8 LLM Provider Abstraction Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-llm";
  const workspaceId = "ws-uuid-llm";
  const providerId = "11111111-9999-8888-7777-666666666666";
  const token = generateAccessToken({ userId, email: "llm@example.com", role: "DEVELOPER" });

  const mockProviderConfig = {
    id: providerId,
    provider: ProviderType.OPENAI,
    apiKeyMasked: "sk-o...1234",
    apiKeyEncrypted: Buffer.from("sk-dummy-key").toString("base64"),
    baseUrl: null,
    isDefault: true,
    isEnabled: true,
    priority: 1,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces/:id/llm/providers should configure provider credentials", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (llmProviderRepository.saveProviderConfig as jest.Mock).mockResolvedValue(mockProviderConfig);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/llm/providers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        provider: "OPENAI",
        apiKey: "sk-openai-secret-key-12345678",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.providerConfig.provider).toBe("OPENAI");
  });

  it("POST /api/v1/workspaces/:id/llm/completion should execute completion with provider fallback", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (llmProviderRepository.findActiveProvidersOrderedByPriority as jest.Mock).mockResolvedValue([
      mockProviderConfig,
    ]);

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/llm/completion`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        model: "GPT_4O",
        userPrompt: "What is quantum computing?",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.completion.provider).toBe("OPENAI");
    expect(res.body.data.completion.content).toContain("quantum computing");
  });

  it("GET /api/v1/workspaces/:id/llm/stream should return Server-Sent Events stream", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (llmProviderRepository.findActiveProvidersOrderedByPriority as jest.Mock).mockResolvedValue([
      mockProviderConfig,
    ]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/llm/stream?userPrompt=Hello`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.text).toContain("data:");
  });

  it("POST /api/v1/workspaces/:id/llm/providers/:providerId/test should test connection", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (llmProviderRepository.findConfigsByWorkspace as jest.Mock).mockResolvedValue([
      mockProviderConfig,
    ]);

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/llm/providers/${providerId}/test`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.healthy).toBe(true);
  });
});
