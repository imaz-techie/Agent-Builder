import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { trainingRepository } from "../src/repositories/training.repository";
import { agentRepository } from "../src/repositories/agent.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { TrainingStatus, WorkspaceRole, AgentStatus, LlmModel } from "@prisma/client";

jest.mock("../src/repositories/training.repository");
jest.mock("../src/repositories/agent.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 6 Training Pipeline Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-train";
  const workspaceId = "ws-uuid-train";
  const agentId = "11111111-1111-1111-1111-111111111111";
  const datasetId = "22222222-2222-2222-2222-222222222222";
  const jobId = "33333333-3333-3333-3333-333333333333";
  const token = generateAccessToken({ userId, email: "trainer@example.com", role: "DEVELOPER" });

  const mockAgent = {
    id: agentId,
    name: "Finance Bot",
    description: "Fine-tuned financial advisor",
    category: "Analytics",
    tags: [],
    status: AgentStatus.ACTIVE,
    currentVersion: "1.0.0",
    model: LlmModel.GPT_4O,
    temperature: 0.5,
    maxTokens: 4096,
    systemPrompt: "You are a financial analyst.",
    avatarColor: "#10B981",
    totalChats: 10,
    lastTrainingAt: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDataset = {
    id: datasetId,
    name: "Financial Q&A v1",
    description: "1000 pairs of financial advice dialogues",
    version: "v1.0",
    sampleCount: 1000,
    fileSizeBytes: BigInt(2048500),
    filePath: null,
    agentId,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJob = {
    id: jobId,
    jobName: "Epoch 3 Fine-Tune Run",
    agentId,
    datasetId,
    status: TrainingStatus.IN_PROGRESS,
    epochs: 3,
    learningRate: 0.0001,
    batchSize: 8,
    currentEpoch: 1,
    totalEpochs: 3,
    progressPercent: 33.3,
    currentLoss: 0.65,
    trainingLogs: ["Job queued at 2026-08-04T18:50:00Z", "Training started. Epoch 1/3"],
    errorMessage: null,
    startedAt: new Date(),
    completedAt: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: mockAgent,
    dataset: mockDataset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces/:id/training/datasets should register fine-tuning dataset", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (trainingRepository.createDataset as jest.Mock).mockResolvedValue(mockDataset);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/training/datasets`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Financial Q&A v1",
        description: "1000 pairs of financial advice dialogues",
        version: "v1.0",
        sampleCount: 1000,
        agentId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dataset.name).toBe("Financial Q&A v1");
  });

  it("POST /api/v1/workspaces/:id/training/jobs should queue fine-tuning job", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (agentRepository.findAgentById as jest.Mock).mockResolvedValue(mockAgent);
    (trainingRepository.createJob as jest.Mock).mockResolvedValue(mockJob);
    (agentRepository.updateAgent as jest.Mock).mockResolvedValue(mockAgent);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/training/jobs`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobName: "Epoch 3 Fine-Tune Run",
        agentId,
        datasetId,
        epochs: 3,
        learningRate: 0.0001,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job.jobName).toBe("Epoch 3 Fine-Tune Run");
  });

  it("GET /api/v1/workspaces/:id/training/jobs should return workspace training jobs", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (trainingRepository.findJobsByWorkspace as jest.Mock).mockResolvedValue({
      items: [mockJob],
      totalItems: 1,
    });

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/training/jobs`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.jobs).toHaveLength(1);
  });

  it("GET /api/v1/workspaces/:id/training/jobs/:jobId/logs should return job logs", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (trainingRepository.findJobById as jest.Mock).mockResolvedValue(mockJob);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/training/jobs/${jobId}/logs`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.logs).toHaveLength(2);
  });

  it("POST /api/v1/workspaces/:id/training/jobs/:jobId/cancel should cancel job", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (trainingRepository.findJobById as jest.Mock).mockResolvedValue(mockJob);
    (trainingRepository.updateJobProgress as jest.Mock).mockResolvedValue({
      ...mockJob,
      status: TrainingStatus.CANCELLED,
    });
    (trainingRepository.appendJobLog as jest.Mock).mockResolvedValue({});
    (agentRepository.updateAgent as jest.Mock).mockResolvedValue(mockAgent);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/training/jobs/${jobId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job.status).toBe("CANCELLED");
  });
});
