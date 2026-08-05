import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createTemplateSchema,
  updateTemplateSchema,
  executePromptSchema,
  comparePromptsSchema,
} from "../validators/prompt.validator";
import {
  createTemplate,
  getWorkspaceTemplates,
  getTemplateDetails,
  updateTemplate,
  deleteTemplate,
  executePrompt,
  streamPromptExecution,
  comparePrompts,
  getExecutionHistory,
} from "../controllers/prompt.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/prompts/templates:
 *   post:
 *     summary: Create Prompt Template
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       201:
 *         description: Template created
 *   get:
 *     summary: List Prompt Templates
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Prompt templates retrieved
 */
router.post(
  "/workspaces/:id/prompts/templates",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(createTemplateSchema),
  asyncHandler(createTemplate)
);

router.get(
  "/workspaces/:id/prompts/templates",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWorkspaceTemplates)
);

/**
 * @openapi
 * /workspaces/{id}/prompts/templates/{templateId}:
 *   get:
 *     summary: Get Template Details
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: templateId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Template details
 *   patch:
 *     summary: Update Template
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: templateId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Template updated
 *   delete:
 *     summary: Delete Template
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: templateId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Template deleted
 */
router.get(
  "/workspaces/:id/prompts/templates/:templateId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getTemplateDetails)
);

router.patch(
  "/workspaces/:id/prompts/templates/:templateId",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(updateTemplateSchema),
  asyncHandler(updateTemplate)
);

router.delete(
  "/workspaces/:id/prompts/templates/:templateId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(deleteTemplate)
);

/**
 * @openapi
 * /workspaces/{id}/prompts/execute:
 *   post:
 *     summary: Execute Single Prompt Test
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Prompt executed
 */
router.post(
  "/workspaces/:id/prompts/execute",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(executePromptSchema),
  asyncHandler(executePrompt)
);

/**
 * @openapi
 * /workspaces/{id}/prompts/stream:
 *   get:
 *     summary: Stream Prompt Execution (SSE)
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Prompt execution stream established
 */
router.get(
  "/workspaces/:id/prompts/stream",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(streamPromptExecution)
);

/**
 * @openapi
 * /workspaces/{id}/prompts/compare:
 *   post:
 *     summary: Side-by-Side Prompt Comparison Test
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Comparison outputs generated
 */
router.post(
  "/workspaces/:id/prompts/compare",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(comparePromptsSchema),
  asyncHandler(comparePrompts)
);

/**
 * @openapi
 * /workspaces/{id}/prompts/executions:
 *   get:
 *     summary: List Execution History
 *     tags:
 *       - Prompt Studio & Playground
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Execution logs retrieved
 */
router.get(
  "/workspaces/:id/prompts/executions",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getExecutionHistory)
);

export default router;
