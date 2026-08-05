import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { realtimeService } from "../src/realtime";
import { promptRepository } from "../src/repositories/prompt.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { LlmModel, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/prompt.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 13 Real-Time Streaming", () => {
  const app = createApp();
  const userId = "user-uuid-111";
  const workspaceId = "ws-uuid-222";
  const token = generateAccessToken({ userId, email: "dev@example.com", role: "DEVELOPER" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Realtime broadcast facade", () => {
    it("should deliver workspace broadcasts to subscribers", () => {
      const received: any[] = [];
      const unsubscribe = realtimeService.subscribe((msg) => received.push(msg));

      realtimeService.emitToWorkspace("ws-abc", "chat:message", { hello: "world" });
      realtimeService.emitToUser("user-xyz", "notification:new", { count: 3 });

      expect(received).toHaveLength(2);
      expect(received[0]).toEqual({
        scope: "workspace",
        target: "ws-abc",
        event: "chat:message",
        payload: { hello: "world" },
      });
      expect(received[1]).toEqual({
        scope: "user",
        target: "user-xyz",
        event: "notification:new",
        payload: { count: 3 },
      });

      unsubscribe();
    });

    it("should stop delivering after unsubscribe", () => {
      const received: any[] = [];
      const unsubscribe = realtimeService.subscribe((msg) => received.push(msg));
      unsubscribe();

      realtimeService.emitToWorkspace("ws-abc", "chat:message", { hello: "world" });

      expect(received).toHaveLength(0);
    });
  });

  describe("Prompt studio SSE streaming", () => {
    it("GET /api/v1/workspaces/:id/prompts/stream should stream chunks and finish", async () => {
      (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
        id: "mem-1",
        workspaceId,
        userId,
        role: WorkspaceRole.MEMBER,
      });
      (promptRepository.createExecution as jest.Mock).mockResolvedValue({
        id: "exec-1",
        templateId: null,
        agentId: null,
        systemPrompt: "You are a helpful AI assistant.",
        userPrompt: "Tell me about agents",
        variablesUsed: null,
        model: LlmModel.GPT_4O,
        outputContent: "[Simulated LLM Output]",
        latencyMs: 12,
        tokensUsed: 42,
        workspaceId,
        createdById: userId,
        createdAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceId}/prompts/stream`)
        .query({ userPrompt: "Tell me about agents", model: "GPT_4O" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/event-stream");
      expect(res.text).toContain('"chunk"');
      expect(res.text).toContain('"done":true');
    });
  });
});
