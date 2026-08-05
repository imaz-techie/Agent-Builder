import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { promptRepository } from "../src/repositories/prompt.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { LlmModel, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/prompt.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 7 Prompt Studio Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-prompt";
  const workspaceId = "ws-uuid-prompt";
  const templateId = "11111111-2222-3333-4444-555555555555";
  const token = generateAccessToken({ userId, email: "prompt@example.com", role: "DEVELOPER" });

  const mockTemplate = {
    id: templateId,
    title: "Customer Greeting Generator",
    description: "Generates customized customer welcome messages",
    category: "Support",
    systemPrompt: "You are a friendly customer service bot.",
    userPromptTemplate: "Hello {{user_name}}, welcome to {{company_name}}!",
    variables: ["user_name", "company_name"],
    model: LlmModel.GPT_4O,
    temperature: 0.7,
    maxTokens: 1024,
    isPublic: false,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExecution = {
    id: "exec-1",
    templateId,
    agentId: null,
    systemPrompt: "You are a friendly customer service bot.",
    userPrompt: "Hello Alice, welcome to Acme Corp!",
    variablesUsed: { user_name: "Alice", company_name: "Acme Corp" },
    model: LlmModel.GPT_4O,
    outputContent: "Response output generated for Alice at Acme Corp.",
    latencyMs: 250,
    tokensUsed: 42,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces/:id/prompts/templates should create template & extract variables", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (promptRepository.createTemplate as jest.Mock).mockResolvedValue(mockTemplate);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/prompts/templates`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Customer Greeting Generator",
        userPromptTemplate: "Hello {{user_name}}, welcome to {{company_name}}!",
        model: "GPT_4O",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.template.title).toBe("Customer Greeting Generator");
    expect(res.body.data.template.variables).toContain("user_name");
  });

  it("GET /api/v1/workspaces/:id/prompts/templates should list templates", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (promptRepository.findTemplatesByWorkspace as jest.Mock).mockResolvedValue([mockTemplate]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/prompts/templates`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.templates).toHaveLength(1);
  });

  it("POST /api/v1/workspaces/:id/prompts/execute should run prompt in playground", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (promptRepository.createExecution as jest.Mock).mockResolvedValue(mockExecution);

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/prompts/execute`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userPrompt: "Hello {{user_name}}",
        variables: { user_name: "Alice" },
        model: "GPT_4O",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.execution.userPrompt).toContain("Alice");
  });

  it("POST /api/v1/workspaces/:id/prompts/compare should execute side-by-side output comparison", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (promptRepository.createExecution as jest.Mock).mockResolvedValue(mockExecution);

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/prompts/compare`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userPrompt: "Translate Hello to Spanish",
        configs: [
          { name: "GPT-4o Config", model: "GPT_4O", temperature: 0.2 },
          { name: "Claude 3.5 Config", model: "CLAUDE_3_5_SONNET", temperature: 0.7 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comparisons).toHaveLength(2);
  });

  it("GET /api/v1/workspaces/:id/prompts/executions should list past execution history", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (promptRepository.findExecutionsByWorkspace as jest.Mock).mockResolvedValue([mockExecution]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/prompts/executions`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.executions).toHaveLength(1);
  });
});
