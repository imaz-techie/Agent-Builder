import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  completionRequestSchema,
  configureProviderSchema,
} from "../validators/llm.validator";
import {
  generateCompletion,
  streamCompletion,
  configureProvider,
  getWorkspaceProviders,
  testProviderConnection,
} from "../controllers/llm.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/llm/completion:
 *   post:
 *     summary: Generate LLM Completion
 *     description: Invocates LLM with automatic provider fallback chain (OpenAI -> Anthropic -> Gemini -> Ollama) and exponential backoff.
 *     tags:
 *       - LLM Providers Layer
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
 *               - model
 *               - userPrompt
 *             properties:
 *               model: { type: "string", enum: ["GPT_4O", "GPT_4O_MINI", "CLAUDE_3_5_SONNET", "GEMINI_1_5_PRO", "LLAMA_3_1_70B"], example: "GPT_4O" }
 *               userPrompt: { type: "string", example: "Explain microservices architecture." }
 *               systemPrompt: { type: "string", example: "You are a software architect." }
 *               temperature: { type: "number", example: 0.7 }
 *     responses:
 *       200:
 *         description: Completion generated
 */
router.post(
  "/workspaces/:id/llm/completion",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(completionRequestSchema),
  asyncHandler(generateCompletion)
);

/**
 * @openapi
 * /workspaces/{id}/llm/stream:
 *   get:
 *     summary: Server-Sent Events (SSE) Real-Time Response Streaming
 *     tags:
 *       - LLM Providers Layer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: model
 *         in: query
 *         schema: { type: "string", example: "GPT_4O" }
 *       - name: userPrompt
 *         in: query
 *         required: true
 *         schema: { type: "string", example: "Tell me a short story" }
 *     responses:
 *       200:
 *         description: Event stream established
 */
router.get(
  "/workspaces/:id/llm/stream",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(streamCompletion)
);

/**
 * @openapi
 * /workspaces/{id}/llm/providers:
 *   post:
 *     summary: Configure LLM Provider API Credentials
 *     tags:
 *       - LLM Providers Layer
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
 *               - provider
 *               - apiKey
 *             properties:
 *               provider: { type: "string", enum: ["OPENAI", "ANTHROPIC", "GEMINI", "AZURE_OPENAI", "OPENROUTER", "OLLAMA"], example: "OPENAI" }
 *               apiKey: { type: "string", example: "sk-proj-openai-secret-key-12345" }
 *               priority: { type: "integer", example: 1 }
 *     responses:
 *       201:
 *         description: Provider configured
 *   get:
 *     summary: List Workspace Providers
 *     tags:
 *       - LLM Providers Layer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Configured providers list
 */
router.post(
  "/workspaces/:id/llm/providers",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(configureProviderSchema),
  asyncHandler(configureProvider)
);

router.get(
  "/workspaces/:id/llm/providers",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWorkspaceProviders)
);

/**
 * @openapi
 * /workspaces/{id}/llm/providers/{providerId}/test:
 *   post:
 *     summary: Test Provider API Connection Health
 *     tags:
 *       - LLM Providers Layer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: providerId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Connection test completed
 */
router.post(
  "/workspaces/:id/llm/providers/:providerId/test",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(testProviderConnection)
);

export default router;
