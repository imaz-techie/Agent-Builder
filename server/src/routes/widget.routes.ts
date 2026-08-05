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
  getPublicWidgetConfig,
  sendPublicWidgetMessage,
  publishWidget,
  regenerateWidgetToken,
} from "../controllers/widget.controller";

const router = Router();

/**
 * Public Embedded Widget Endpoints (No bearer token required)
 */

/**
 * @openapi
 * /public/widgets/{token}/config:
 *   get:
 *     summary: Get Public Chat Widget Customization & Config
 *     tags:
 *       - Embeddable Chat Widget
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema: { type: "string", example: "wt_live_99887766" }
 *     responses:
 *       200:
 *         description: Widget configuration retrieved
 */
router.get("/public/widgets/:token/config", asyncHandler(getPublicWidgetConfig));
router.get("/widgets/:token/config", asyncHandler(getPublicWidgetConfig));

/**
 * @openapi
 * /public/widgets/{token}/chat:
 *   post:
 *     summary: Public Widget Chat Message Submission
 *     tags:
 *       - Embeddable Chat Widget
 *     parameters:
 *       - name: token
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
 *               - message
 *             properties:
 *               message: { type: "string", example: "Hello, how do I reset my password?" }
 *               sessionId: { type: "string", example: "public-session-uuid" }
 *     responses:
 *       200:
 *         description: Assistant response generated
 */
router.post(
  "/public/widgets/:token/chat",
  validate(publicWidgetChatSchema),
  asyncHandler(sendPublicWidgetMessage)
);

router.post(
  "/widgets/:token/chat",
  validate(publicWidgetChatSchema),
  asyncHandler(sendPublicWidgetMessage)
);

/**
 * Workspace Admin Widget Configuration
 */
router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/agents/{agentId}/widget:
 *   put:
 *     summary: Save/Upsert Agent Chat Widget Configuration (PUT)
 *     tags:
 *       - Embeddable Chat Widget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: "string", example: "Customer Support" }
 *               primaryColor: { type: "string", example: "#3B82F6" }
 *     responses:
 *       200:
 *         description: Widget configuration saved
 *   post:
 *     summary: Save/Upsert Agent Chat Widget Configuration (POST)
 *     tags:
 *       - Embeddable Chat Widget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: "string", example: "Customer Support" }
 *               primaryColor: { type: "string", example: "#3B82F6" }
 *     responses:
 *       200:
 *         description: Widget configuration saved
 *   get:
 *     summary: Get Agent Chat Widget Configuration
 *     tags:
 *       - Embeddable Chat Widget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: agentId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Widget configuration retrieved
 */
router.put(
  "/workspaces/:id/agents/:agentId/widget",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(upsertWidgetConfigSchema),
  asyncHandler(upsertWidgetConfig)
);

router.post(
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
 * /workspaces/{id}/widgets/{widgetId}/publish:
 *   post:
 *     summary: Publish Widget
 *     tags:
 *       - Embeddable Chat Widget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: widgetId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Widget published
 */
router.post(
  "/workspaces/:id/widgets/:widgetId/publish",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(publishWidget)
);

/**
 * @openapi
 * /workspaces/{id}/widgets/{widgetId}/token:
 *   post:
 *     summary: Regenerate Widget Token
 *     tags:
 *       - Embeddable Chat Widget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: widgetId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Widget token regenerated
 */
router.post(
  "/workspaces/:id/widgets/:widgetId/token",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(regenerateWidgetToken)
);

export default router;
