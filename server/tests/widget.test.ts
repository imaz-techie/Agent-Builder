import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { widgetRepository } from "../src/repositories/widget.repository";
import { agentRepository } from "../src/repositories/agent.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { chatRepository } from "../src/repositories/chat.repository";
import { chatService } from "../src/services/chat.service";
import { AgentStatus, LlmModel, WidgetTheme, WidgetLauncherPosition, WorkspaceRole, ChatRole } from "@prisma/client";

jest.mock("../src/repositories/widget.repository");
jest.mock("../src/repositories/agent.repository");
jest.mock("../src/repositories/workspace.repository");
jest.mock("../src/repositories/chat.repository");
jest.mock("../src/services/chat.service");

describe("Phase 12 Embed Widget Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-111";
  const workspaceId = "ws-uuid-222";
  const agentId = "agent-uuid-333";
  const widgetId = "widget-uuid-444";
  const widgetToken = "wgt_testtoken1234567890abcdef";
  const token = generateAccessToken({ userId, email: "dev@example.com", role: "DEVELOPER" });

  const mockAgent = {
    id: agentId,
    name: "Customer Support Agent",
    description: "Handles user inquiries",
    category: "Support",
    tags: [],
    status: AgentStatus.ACTIVE,
    currentVersion: "1.0.0",
    model: LlmModel.GPT_4O,
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: "You are a professional customer support assistant.",
    avatarColor: "#3B82F6",
    totalChats: 5,
    lastTrainingAt: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWidget = {
    id: widgetId,
    agentId,
    workspaceId,
    title: "Chat with our assistant",
    welcomeMessage: "Hi there! How can I help you today?",
    theme: WidgetTheme.LIGHT,
    primaryColor: "#3B82F6",
    launcherPosition: WidgetLauncherPosition.BOTTOM_RIGHT,
    launcherSize: 56,
    showAvatar: true,
    avatarUrl: null,
    allowFileUpload: false,
    enableRag: true,
    prePrompt: null,
    isPublished: true,
    widgetToken,
    customDomain: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: mockAgent,
    workspace: { id: workspaceId },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("PUT /api/v1/workspaces/:id/agents/:agentId/widget should create widget config", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (agentRepository.findAgentById as jest.Mock).mockResolvedValue(mockAgent);
    (widgetRepository.findWidgetByAgent as jest.Mock).mockResolvedValue(null);
    (widgetRepository.upsertWidgetConfig as jest.Mock).mockResolvedValue(mockWidget);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .put(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/widget`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Chat with our assistant", primaryColor: "#3B82F6" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.config.id).toBe(widgetId);
  });

  it("GET /api/v1/workspaces/:id/agents/:agentId/widget should return widget config", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (widgetRepository.findWidgetByAgent as jest.Mock).mockResolvedValue(mockWidget);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/agents/${agentId}/widget`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.config.widgetToken).toBe(widgetToken);
  });

  it("POST /api/v1/workspaces/:id/widgets/:widgetId/publish should publish widget", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (widgetRepository.findWidgetById as jest.Mock).mockResolvedValue(mockWidget);
    (widgetRepository.updateWidget as jest.Mock).mockResolvedValue({
      ...mockWidget,
      isPublished: true,
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/widgets/${widgetId}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.config.isPublished).toBe(true);
  });

  it("POST /api/v1/workspaces/:id/widgets/:widgetId/token should regenerate token", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (widgetRepository.findWidgetById as jest.Mock).mockResolvedValue(mockWidget);
    (widgetRepository.updateWidget as jest.Mock).mockResolvedValue({
      ...mockWidget,
      widgetToken: "wgt_newtoken9876543210abcdef",
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/widgets/${widgetId}/token`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.config.widgetToken).toBe("wgt_newtoken9876543210abcdef");
  });

  it("GET /api/v1/public/widgets/:token/config should return public config without auth", async () => {
    (widgetRepository.findPublishedWidgetByToken as jest.Mock).mockResolvedValue(mockWidget);

    const res = await request(app).get(`/api/v1/public/widgets/${widgetToken}/config`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.config.agent.name).toBe("Customer Support Agent");
    expect(res.body.data.config.widgetToken).toBe(widgetToken);
  });

  it("POST /api/v1/public/widgets/:token/chat should process widget message without auth", async () => {
    (widgetRepository.findPublishedWidgetByToken as jest.Mock).mockResolvedValue(mockWidget);
    (chatRepository.findSessionById as jest.Mock).mockResolvedValue(null);
    (chatService.createSession as jest.Mock).mockResolvedValue({
      id: "session-uuid-555",
      agentId,
      title: "Widget Chat",
      workspaceId,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (chatService.sendMessage as jest.Mock).mockResolvedValue({
      userMessage: {
        id: "msg-1",
        role: ChatRole.USER,
        content: "Hello",
      },
      assistantMessage: {
        id: "msg-2",
        role: ChatRole.ASSISTANT,
        content: "Hi there!",
      },
    });

    const res = await request(app)
      .post(`/api/v1/public/widgets/${widgetToken}/chat`)
      .send({ message: "Hello" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessionId).toBe("session-uuid-555");
    expect(res.body.data.assistantMessage.content).toBe("Hi there!");
  });
});
