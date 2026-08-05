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
 *     summary: Generate LLM completion with automatic provider fallback chain
 *     tags:
 *       - LLM Providers
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
 *     summary: Server-Sent Events (SSE) real-time response streaming
 *     tags:
 *       - LLM Providers
 */
router.get(
  "/workspaces/:id/llm/stream",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(streamCompletion)
);

/**
 * Provider Credential Management
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

router.post(
  "/workspaces/:id/llm/providers/:providerId/test",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(testProviderConnection)
);

export default router;
