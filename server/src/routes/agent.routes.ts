import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createAgentSchema,
  updateAgentSchema,
  agentQuerySchema,
  cloneAgentSchema,
} from "../validators/agent.validator";
import {
  createAgent,
  getWorkspaceAgents,
  getAgentDetails,
  updateAgent,
  cloneAgent,
  archiveAgent,
  deleteAgent,
  getAgentVersions,
} from "../controllers/agent.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/agents:
 *   post:
 *     summary: Create a new AI agent in workspace
 *     tags:
 *       - Agents
 *   get:
 *     summary: List, search, filter, and paginate workspace agents
 *     tags:
 *       - Agents
 */
router.post(
  "/workspaces/:id/agents",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(createAgentSchema),
  asyncHandler(createAgent)
);

router.get(
  "/workspaces/:id/agents",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(agentQuerySchema),
  asyncHandler(getWorkspaceAgents)
);

/**
 * @openapi
 * /workspaces/{id}/agents/{agentId}:
 *   get:
 *     summary: Get agent details and configuration
 *   patch:
 *     summary: Update agent parameters
 *   delete:
 *     summary: Delete agent permanently
 */
router.get(
  "/workspaces/:id/agents/:agentId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getAgentDetails)
);

router.patch(
  "/workspaces/:id/agents/:agentId",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(updateAgentSchema),
  asyncHandler(updateAgent)
);

router.delete(
  "/workspaces/:id/agents/:agentId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(deleteAgent)
);

/**
 * Special Agent Actions (Clone, Archive, Versions)
 */
router.post(
  "/workspaces/:id/agents/:agentId/clone",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(cloneAgentSchema),
  asyncHandler(cloneAgent)
);

router.post(
  "/workspaces/:id/agents/:agentId/archive",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(archiveAgent)
);

router.get(
  "/workspaces/:id/agents/:agentId/versions",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getAgentVersions)
);

export default router;
