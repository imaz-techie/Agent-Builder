import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { agentRepository } from "../src/repositories/agent.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { AgentStatus, LlmModel, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/agent.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 4 Agent Management Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-111";
  const workspaceId = "ws-uuid-222";
  const agentId = "agent-uuid-333";
  const token = generateAccessToken({ userId, email: "dev@example.com", role: "DEVELOPER" });

  const mockAgent = {
    id: agentId,
    name: "Customer Support Agent",
    description: "Handles user inquiries and ticket resolution",
    category: "Support",
    tags: ["support", "zendesk"],
    status: AgentStatus.ACTIVE,
    currentVersion: "1.0.0",
    model: LlmModel.GPT_4O,
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: "You are a professional customer support assistant.",
    avatarColor: "#3B82F6",
    totalChats: 42,
    lastTrainingAt: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    versions: [
      {
        id: "ver-1",
        agentId,
        versionNumber: "1.0.0",
        systemPrompt: "You are a professional customer support assistant.",
        model: LlmModel.GPT_4O,
        temperature: 0.7,
        maxTokens: 4096,
        changelog: "Initial agent creation",
        createdById: userId,
        createdAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces/:id/agents should create new AI agent", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (agentRepository.createAgent as jest.Mock).mockResolvedValue(mockAgent);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/agents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Customer Support Agent",
        description: "Handles user inquiries and ticket resolution",
        category: "Support",
        model: "GPT_4O",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.name).toBe("Customer Support Agent");
  });

  it("GET /api/v1/workspaces/:id/agents should return paginated list", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (agentRepository.findAgents as jest.Mock).mockResolvedValue({
      items: [mockAgent],
      totalItems: 1,
    });

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/agents?page=1&limit=10`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agents).toHaveLength(1);
    expect(res.body.meta.totalItems).toBe(1);
  });

  it("GET /api/v1/workspaces/:id/agents/:agentId should return agent details", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (agentRepository.findAgentById as jest.Mock).mockResolvedValue(mockAgent);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/agents/${agentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.id).toBe(agentId);
  });

  it("POST /api/v1/workspaces/:id/agents/:agentId/clone should duplicate agent", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (agentRepository.findAgentById as jest.Mock).mockResolvedValue(mockAgent);
    (agentRepository.createAgent as jest.Mock).mockResolvedValue({
      ...mockAgent,
      id: "cloned-uuid-444",
      name: "Customer Support Agent (Copy)",
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/clone`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Customer Support Agent (Copy)" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.name).toBe("Customer Support Agent (Copy)");
  });

  it("POST /api/v1/workspaces/:id/agents/:agentId/archive should set status to INACTIVE", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (agentRepository.updateAgent as jest.Mock).mockResolvedValue({
      ...mockAgent,
      status: AgentStatus.INACTIVE,
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.status).toBe("INACTIVE");
  });

  it("DELETE /api/v1/workspaces/:id/agents/:agentId should delete agent", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (agentRepository.deleteAgent as jest.Mock).mockResolvedValue({ count: 1 });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/v1/workspaces/${workspaceId}/agents/${agentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
