import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { analyticsRepository } from "../src/repositories/analytics.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { calculateTokenCost } from "../src/utils/costCalculator";
import { LlmModel, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/analytics.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 11 Analytics System Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-analytics";
  const workspaceId = "ws-uuid-analytics";
  const token = generateAccessToken({ userId, email: "analytics@example.com", role: "DEVELOPER" });

  const mockAuditLog = {
    id: "audit-1",
    userId,
    workspaceId,
    action: "AGENT_CREATED",
    ipAddress: "127.0.0.1",
    metadata: { agentName: "Test Bot" },
    createdAt: new Date(),
    user: { id: userId, name: "Analytics Tester", email: "analytics@example.com" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("CostCalculator should calculate accurate USD token cost", () => {
    const costGpt4o = calculateTokenCost(LlmModel.GPT_4O, 1_000_000);
    expect(costGpt4o).toBe(9.0); // (600k/1M * 5) + (400k/1M * 15) = 3 + 6 = 9.0

    const costMini = calculateTokenCost(LlmModel.GPT_4O_MINI, 1_000_000);
    expect(costMini).toBeLessThan(1.0);
  });

  it("GET /api/v1/workspaces/:id/analytics/overview should return metric cards summary", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (analyticsRepository.getWorkspaceMessageStats as jest.Mock).mockResolvedValue({
      totalMessages: 50,
      totalTokens: 25000,
      avgLatencyMs: 320,
    });
    (analyticsRepository.getWorkspaceAgents as jest.Mock).mockResolvedValue([]);
    (analyticsRepository.getKnowledgeFilesCount as jest.Mock).mockResolvedValue(5);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/analytics/overview`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overview.totalChats).toBe(50);
    expect(res.body.data.overview.totalTokens).toBe(25000);
  });

  it("GET /api/v1/workspaces/:id/analytics/audit-logs should return paginated audit trail", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (analyticsRepository.findAuditLogs as jest.Mock).mockResolvedValue({
      items: [mockAuditLog],
      totalItems: 1,
    });

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/analytics/audit-logs`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.auditLogs).toHaveLength(1);
    expect(res.body.data.auditLogs[0].action).toBe("AGENT_CREATED");
  });

  it("GET /api/v1/workspaces/:id/analytics/export should export CSV file", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (analyticsRepository.getWorkspaceMessageStats as jest.Mock).mockResolvedValue({
      totalMessages: 10,
      totalTokens: 5000,
      avgLatencyMs: 250,
    });
    (analyticsRepository.getWorkspaceAgents as jest.Mock).mockResolvedValue([]);
    (analyticsRepository.getKnowledgeFilesCount as jest.Mock).mockResolvedValue(2);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/analytics/export?format=csv`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text).toContain("Agent Name,Model,Status");
  });
});
