import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import { createApiKeySchema } from "../validators/workspace.validator";
import {
  createApiKey,
  getWorkspaceApiKeys,
  revokeApiKey,
} from "../controllers/apiKey.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/api-keys:
 *   post:
 *     summary: Create new API key for workspace
 *     tags:
 *       - API Keys
 *   get:
 *     summary: List API keys for workspace
 *     tags:
 *       - API Keys
 */
router.post(
  "/workspaces/:id/api-keys",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(createApiKeySchema),
  asyncHandler(createApiKey)
);

router.get(
  "/workspaces/:id/api-keys",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(getWorkspaceApiKeys)
);

/**
 * @openapi
 * /workspaces/{id}/api-keys/{keyId}:
 *   delete:
 *     summary: Revoke an API key
 *     tags:
 *       - API Keys
 */
router.delete(
  "/workspaces/:id/api-keys/:keyId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(revokeApiKey)
);

export default router;
