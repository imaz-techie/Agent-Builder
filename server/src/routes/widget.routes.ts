import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  upsertWidgetConfigSchema,
  publicWidgetChatSchema,
} from "../validators/widget.validator";
import {
  upsertWidgetConfig,
  getWidgetConfig,
  updateWidgetConfig,
  deleteWidgetConfig,
  publishWidget,
  regenerateWidgetToken,
  getPublicWidgetConfig,
  sendPublicWidgetMessage,
} from "../controllers/widget.controller";

const router = Router();

/**
 * @openapi
 * /public/widgets/{token}/config:
 *   get:
 *     summary: Get public embeddable widget configuration by token (no auth)
 *     tags:
 *       - Embed Widget
 */
router.get("/public/widgets/:token/config", asyncHandler(getPublicWidgetConfig));

/**
 * @openapi
 * /public/widgets/{token}/chat:
 *   post:
 *     summary: Send a chat message from an embedded widget (no auth)
 *     tags:
 *       - Embed Widget
 */
router.post(
  "/public/widgets/:token/chat",
  validate(publicWidgetChatSchema),
  asyncHandler(sendPublicWidgetMessage)
);

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/agents/{agentId}/widget:
 *   put:
 *     summary: Create or update the chat widget configuration for an agent
 *     tags:
 *       - Embed Widget
 *   get:
 *     summary: Get widget configuration for an agent
 *     tags:
 *       - Embed Widget
 */
router.put(
  "/workspaces/:id/agents/:agentId/widget",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(upsertWidgetConfigSchema),
  asyncHandler(upsertWidgetConfig)
);

router.get(
  "/workspaces/:id/agents/:agentId/widget",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWidgetConfig)
);

/**
 * @openapi
 * /workspaces/{id}/widgets/{widgetId}:
 *   patch:
 *     summary: Update widget configuration
 *     tags:
 *       - Embed Widget
 *   delete:
 *     summary: Delete widget configuration
 *     tags:
 *       - Embed Widget
 */
router.patch(
  "/workspaces/:id/widgets/:widgetId",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(upsertWidgetConfigSchema),
  asyncHandler(updateWidgetConfig)
);

router.delete(
  "/workspaces/:id/widgets/:widgetId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(deleteWidgetConfig)
);

/**
 * @openapi
 * /workspaces/{id}/widgets/{widgetId}/publish:
 *   post:
 *     summary: Publish widget for public embedding
 *     tags:
 *       - Embed Widget
 * /workspaces/{id}/widgets/{widgetId}/token:
 *   post:
 *     summary: Regenerate widget security token
 *     tags:
 *       - Embed Widget
 */
router.post(
  "/workspaces/:id/widgets/:widgetId/publish",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(publishWidget)
);

router.post(
  "/workspaces/:id/widgets/:widgetId/token",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(regenerateWidgetToken)
);

export default router;
