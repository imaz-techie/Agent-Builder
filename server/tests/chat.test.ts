import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { chatRepository } from "../src/repositories/chat.repository";
import { agentRepository } from "../src/repositories/agent.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { llmService } from "../src/services/llm.service";
import { ragService } from "../src/services/rag.service";
import { ChatRole, WorkspaceRole, AgentStatus, LlmModel } from "@prisma/client";

jest.mock("../src/repositories/chat.repository");
jest.mock("../src/repositories/agent.repository");
jest.mock("../src/repositories/workspace.repository");
jest.mock("../src/services/llm.service");
jest.mock("../src/services/rag.service");

describe("Phase 10 Chat Execution Engine Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-chat";
  const workspaceId = "ws-uuid-chat";
  const agentId = "11111111-0000-0000-0000-000000000000";
  const sessionId = "22222222-0000-0000-0000-000000000000";
  const token = generateAccessToken({ userId, email: "chat@example.com", role: "DEVELOPER" });

  const mockAgent = {
    id: agentId,
    name: "Customer Assistant Bot",
    description: "AI Support Agent",
    category: "Support",
    tags: [],
    status: AgentStatus.ACTIVE,
    currentVersion: "1.0.0",
    model: LlmModel.GPT_4O,
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "You are a customer support representative.",
    avatarColor: "#3B82F6",
    totalChats: 5,
    lastTrainingAt: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: sessionId,
    agentId,
    title: "Chat with Customer Assistant Bot",
    metadata: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: mockAgent,
  };

  const mockUserMsg = {
    id: "msg-user-1",
    sessionId,
    role: ChatRole.USER,
    content: "What are your support hours?",
    tokensCount: 6,
    latencyMs: 0,
    citations: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
  };

  const mockAssistantMsg = {
    id: "msg-asst-1",
    sessionId,
    role: ChatRole.ASSISTANT,
    content: "Our support team is available 24/7.",
    tokensCount: 7,
    latencyMs: 320,
    citations: [],
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces/:id/chat/sessions should create conversation session", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (agentRepository.findAgentById as jest.Mock).mockResolvedValue(mockAgent);
    (chatRepository.createSession as jest.Mock).mockResolvedValue(mockSession);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/chat/sessions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ agentId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.session.agentId).toBe(agentId);
  });

  it("POST /api/v1/workspaces/:id/chat/messages should process prompt assembly & generate assistant response", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (chatRepository.findSessionById as jest.Mock).mockResolvedValue(mockSession);
    (chatRepository.createMessage as jest.Mock)
      .mockResolvedValueOnce(mockUserMsg)
      .mockResolvedValueOnce(mockAssistantMsg);
    (ragService.queryRag as jest.Mock).mockResolvedValue({
      context: "Support hours: 24/7",
      citations: [],
    });
    (llmService.generateCompletion as jest.Mock).mockResolvedValue({
      provider: "OPENAI",
      model: "GPT_4O",
      content: "Our support team is available 24/7.",
      tokensUsed: 7,
      latencyMs: 320,
    });
    (agentRepository.incrementAgentChats as jest.Mock).mockResolvedValue({});
    (chatRepository.touchSession as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/chat/messages`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        sessionId,
        content: "What are your support hours?",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assistantMessage.content).toContain("24/7");
  });

  it("GET /api/v1/workspaces/:id/chat/sessions/:sessionId/messages should return chat message history", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (chatRepository.findSessionById as jest.Mock).mockResolvedValue(mockSession);
    (chatRepository.findMessagesBySession as jest.Mock).mockResolvedValue([
      mockUserMsg,
      mockAssistantMsg,
    ]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/chat/sessions/${sessionId}/messages`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages).toHaveLength(2);
  });
});
