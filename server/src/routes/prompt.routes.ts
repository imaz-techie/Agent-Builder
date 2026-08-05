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
  comparePrompts,
  getExecutionHistory,
  streamPromptExecution,
} from "../controllers/prompt.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * Prompt Templates
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
 * Playground Execution & Output Comparison
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
 *     summary: Stream prompt execution output as Server-Sent Events (SSE)
 *     tags:
 *       - Prompt Studio
 */
router.get(
  "/workspaces/:id/prompts/stream",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(streamPromptExecution)
);

router.post(
  "/workspaces/:id/prompts/compare",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(comparePromptsSchema),
  asyncHandler(comparePrompts)
);

router.get(
  "/workspaces/:id/prompts/executions",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getExecutionHistory)
);

export default router;
