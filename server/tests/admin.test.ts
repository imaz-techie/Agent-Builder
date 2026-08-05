import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { adminRepository } from "../src/repositories/admin.repository";
import { Role } from "@prisma/client";

jest.mock("../src/repositories/admin.repository");

describe("Phase 16 Admin & Platform Management Endpoints", () => {
  const app = createApp();
  const adminId = "admin-uuid-111";
  const targetUserId = "user-uuid-222";
  const adminToken = generateAccessToken({ userId: adminId, email: "admin@example.com", role: "ADMIN" });
  const developerToken = generateAccessToken({ userId: "dev-uuid-333", email: "dev@example.com", role: "DEVELOPER" });

  const mockUser = {
    id: targetUserId,
    email: "dev@example.com",
    name: "Dev User",
    avatarUrl: null,
    role: Role.DEVELOPER,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStats = {
    totalUsers: 12,
    totalWorkspaces: 8,
    totalAgents: 34,
    activeAgents: 21,
    totalChatMessages: 1560,
    totalTokensUsed: 4520000,
    totalKnowledgeFiles: 17,
    totalTrainingJobs: 9,
    totalApiKeys: 15,
    totalCostUsd: 42.5,
    system: {
      nodeVersion: process.version,
      platform: "win32 x64",
      uptimeSeconds: 120,
      memoryMb: 200,
      databaseConnected: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/v1/admin/stats should return platform stats for admins", async () => {
    (adminRepository.getPlatformStats as jest.Mock).mockResolvedValue(mockStats);
    (adminRepository.getTotalSpendUsd as jest.Mock).mockResolvedValue(42.5);

    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats.totalUsers).toBe(12);
    expect(res.body.data.stats.totalCostUsd).toBe(42.5);
  });

  it("GET /api/v1/admin/stats should be forbidden for non-admin roles", async () => {
    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${developerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/admin/users should return paginated platform users", async () => {
    (adminRepository.findUsers as jest.Mock).mockResolvedValue({
      items: [mockUser],
      totalItems: 1,
    });

    const res = await request(app)
      .get("/api/v1/admin/users?search=dev")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(1);
    expect(res.body.meta.totalItems).toBe(1);
  });

  it("PATCH /api/v1/admin/users/:userId should update user role", async () => {
    (adminRepository.updateUser as jest.Mock).mockResolvedValue({
      ...mockUser,
      role: Role.ADMIN,
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "ADMIN" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("ADMIN");
  });

  it("DELETE /api/v1/admin/users/:userId should delete user", async () => {
    (adminRepository.deleteUser as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .delete(`/api/v1/admin/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/v1/admin/workspaces should return paginated workspaces", async () => {
    (adminRepository.findWorkspaces as jest.Mock).mockResolvedValue({
      items: [
        {
          id: "ws-1",
          name: "Acme Corp",
          slug: "acme-corp",
          logoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { members: 4, agents: 6 },
        },
      ],
      totalItems: 1,
    });

    const res = await request(app)
      .get("/api/v1/admin/workspaces")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.workspaces).toHaveLength(1);
    expect(res.body.data.workspaces[0]._count.agents).toBe(6);
  });

  it("GET /api/v1/admin/system/logs should return system logs", async () => {
    (adminRepository.findSystemLogs as jest.Mock).mockResolvedValue([
      { id: "log-1", level: "info", message: "Server started", metadata: null, timestamp: new Date() },
    ]);

    const res = await request(app)
      .get("/api/v1/admin/system/logs?limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.logs).toHaveLength(1);
  });

  it("GET /api/v1/admin/telemetry should return system telemetry", async () => {
    const res = await request(app)
      .get("/api/v1/admin/telemetry")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.telemetry).toHaveProperty("uptimeSeconds");
    expect(res.body.data.telemetry).toHaveProperty("processMemoryMb");
    expect(res.body.data.telemetry).toHaveProperty("databaseConnected");
  });
});
