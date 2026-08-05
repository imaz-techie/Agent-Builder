import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createApiKeySchema,
  updateApiKeySchema,
} from "../validators/apiKey.validator";
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
 *     summary: Create API Key
 *     description: Generates a secret API key with ag_live_ prefix for backend integration.
 *     tags:
 *       - API Keys
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
 *               - name
 *             properties:
 *               name: { type: "string", example: "Production Backend Key" }
 *               permissions: { type: "array", items: { type: "string", enum: ["READ", "WRITE", "ADMIN"] }, example: ["READ", "WRITE"] }
 *     responses:
 *       201:
 *         description: API key generated
 *   get:
 *     summary: List Workspace API Keys
 *     tags:
 *       - API Keys
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: API keys retrieved
 */
router.post(
  "/workspaces/:id/api-keys",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(createApiKeySchema),
  asyncHandler(createApiKey)
);

router.get(
  "/workspaces/:id/api-keys",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWorkspaceApiKeys)
);

/**
 * @openapi
 * /workspaces/{id}/api-keys/{keyId}:
 *   delete:
 *     summary: Revoke API Key
 *     tags:
 *       - API Keys
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: keyId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: API key revoked
 */
router.delete(
  "/workspaces/:id/api-keys/:keyId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(revokeApiKey)
);

export default router;
