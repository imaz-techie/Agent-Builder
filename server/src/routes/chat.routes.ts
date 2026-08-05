import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createSessionSchema,
  sendMessageSchema,
} from "../validators/chat.validator";
import {
  createSession,
  getWorkspaceSessions,
  getSessionMessages,
  sendMessage,
  streamMessage,
} from "../controllers/chat.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/chat/sessions:
 *   post:
 *     summary: Create Agent Conversation Session
 *     tags:
 *       - Chat Execution Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *             properties:
 *               agentId: { type: "string", format: "uuid", example: "11111111-1111-1111-1111-111111111111" }
 *               title: { type: "string", example: "Chat with Customer Assistant" }
 *     responses:
 *       201:
 *         description: Session created
 *   get:
 *     summary: List Workspace Conversation Sessions
 *     tags:
 *       - Chat Execution Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Sessions retrieved
 */
router.post(
  "/workspaces/:id/chat/sessions",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(createSessionSchema),
  asyncHandler(createSession)
);

router.get(
  "/workspaces/:id/chat/sessions",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWorkspaceSessions)
);

/**
 * @openapi
 * /workspaces/{id}/chat/sessions/{sessionId}/messages:
 *   get:
 *     summary: Get Session Chat History Messages
 *     tags:
 *       - Chat Execution Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Messages history retrieved
 */
router.get(
  "/workspaces/:id/chat/sessions/:sessionId/messages",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getSessionMessages)
);

/**
 * @openapi
 * /workspaces/{id}/chat/messages:
 *   post:
 *     summary: Send Chat Message to Agent
 *     description: Assembles Agent System Prompt + RAG Context + History, executes LLM completion, and logs latency & citations.
 *     tags:
 *       - Chat Execution Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - content
 *             properties:
 *               sessionId: { type: "string", format: "uuid", example: "22222222-2222-2222-2222-222222222222" }
 *               content: { type: "string", example: "How do I upgrade my subscription?" }
 *               enableRag: { type: "boolean", example: true }
 *     responses:
 *       200:
 *         description: Chat response generated with citations
 */
router.post(
  "/workspaces/:id/chat/messages",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(sendMessageSchema),
  asyncHandler(sendMessage)
);

/**
 * @openapi
 * /workspaces/{id}/chat/stream:
 *   get:
 *     summary: Real-Time SSE Agent Token Streaming
 *     tags:
 *       - Chat Execution Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: sessionId
 *         in: query
 *         required: true
 *         schema: { type: "string" }
 *       - name: content
 *         in: query
 *         required: true
 *         schema: { type: "string", example: "Hello Agent" }
 *     responses:
 *       200:
 *         description: Event stream established
 */
router.get(
  "/workspaces/:id/chat/stream",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(streamMessage)
);

export default router;
