import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { deploymentRepository } from "../src/repositories/deployment.repository";
import { agentRepository } from "../src/repositories/agent.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { AgentStatus, DeploymentEnvironment, DeploymentStatus, LlmModel, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/deployment.repository");
jest.mock("../src/repositories/agent.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 12 Deployment Manager Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-111";
  const workspaceId = "ws-uuid-222";
  const agentId = "agent-uuid-333";
  const deploymentId = "deploy-uuid-444";
  const token = generateAccessToken({ userId, email: "dev@example.com", role: "DEVELOPER" });

  const mockAgent = {
    id: agentId,
    name: "Customer Support Agent",
    description: "Handles user inquiries and ticket resolution",
    category: "Support",
    tags: ["support"],
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
  };

  const mockDeployment = {
    id: deploymentId,
    agentId,
    workspaceId,
    environment: DeploymentEnvironment.PRODUCTION,
    status: DeploymentStatus.ACTIVE,
    versionNumber: "1.0.0",
    url: "https://agent.example.com",
    domain: "agent.example.com",
    deployedById: userId,
    deployedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: mockAgent,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces/:id/deployments should deploy an agent", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (agentRepository.findAgentById as jest.Mock).mockResolvedValue(mockAgent);
    (deploymentRepository.setAllInactive as jest.Mock).mockResolvedValue({ count: 0 });
    (deploymentRepository.createDeployment as jest.Mock).mockResolvedValue(mockDeployment);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/deployments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ agentId, environment: "PRODUCTION" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deployment.id).toBe(deploymentId);
    expect(deploymentRepository.createDeployment).toHaveBeenCalled();
  });

  it("GET /api/v1/workspaces/:id/deployments should return paginated list", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (deploymentRepository.findDeployments as jest.Mock).mockResolvedValue({
      items: [mockDeployment],
      totalItems: 1,
    });

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/deployments?environment=PRODUCTION`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deployments).toHaveLength(1);
    expect(res.body.meta.totalItems).toBe(1);
  });

  it("GET /api/v1/workspaces/:id/deployments/:deploymentId should return deployment details", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (deploymentRepository.findDeploymentById as jest.Mock).mockResolvedValue(mockDeployment);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/deployments/${deploymentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deployment.id).toBe(deploymentId);
  });

  it("PATCH /api/v1/workspaces/:id/deployments/:deploymentId should update deployment", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (deploymentRepository.findDeploymentById as jest.Mock).mockResolvedValue(mockDeployment);
    (deploymentRepository.updateDeployment as jest.Mock).mockResolvedValue({
      ...mockDeployment,
      status: DeploymentStatus.INACTIVE,
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .patch(`/api/v1/workspaces/${workspaceId}/deployments/${deploymentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "INACTIVE" });

    expect(res.status).toBe(200);
    expect(res.body.data.deployment.status).toBe("INACTIVE");
  });

  it("POST /api/v1/workspaces/:id/deployments/:deploymentId/rollback should restore previous deployment", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (deploymentRepository.findDeploymentById as jest.Mock).mockResolvedValue(mockDeployment);
    (deploymentRepository.findPreviousDeployment as jest.Mock).mockResolvedValue({
      ...mockDeployment,
      id: "deploy-uuid-prev",
      versionNumber: "0.9.0",
    });
    (deploymentRepository.setAllInactive as jest.Mock).mockResolvedValue({ count: 1 });
    (deploymentRepository.updateDeployment as jest.Mock).mockResolvedValue({
      ...mockDeployment,
      id: "deploy-uuid-prev",
      status: DeploymentStatus.ACTIVE,
      versionNumber: "0.9.0",
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/deployments/${deploymentId}/rollback`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deployment.id).toBe("deploy-uuid-prev");
  });

  it("DELETE /api/v1/workspaces/:id/deployments/:deploymentId should delete deployment", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (deploymentRepository.deleteDeployment as jest.Mock).mockResolvedValue({ count: 1 });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/v1/workspaces/${workspaceId}/deployments/${deploymentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
