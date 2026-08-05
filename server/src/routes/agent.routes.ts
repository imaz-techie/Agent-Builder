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
} from "../validators/agent.validator";
import {
  createAgent,
  getWorkspaceAgents,
  getAgentDetails,
  updateAgent,
  deleteAgent,
  cloneAgent,
  archiveAgent,
  getAgentVersions,
} from "../controllers/agent.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/agents:
 *   post:
 *     summary: Create Agent
 *     tags:
 *       - Agent Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       201:
 *         description: Agent created
 *   get:
 *     summary: List Workspace Agents
 *     tags:
 *       - Agent Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Agents retrieved
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
 *     summary: Get Agent Details
 *     tags:
 *       - Agent Management
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
 *         description: Agent details retrieved
 *   patch:
 *     summary: Update Agent
 *     tags:
 *       - Agent Management
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
 *         description: Agent updated
 *   delete:
 *     summary: Delete Agent
 *     tags:
 *       - Agent Management
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
 *         description: Agent deleted
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
 * @openapi
 * /workspaces/{id}/agents/{agentId}/clone:
 *   post:
 *     summary: Clone Agent
 *     tags:
 *       - Agent Management
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
 *       201:
 *         description: Agent cloned
 */
router.post(
  "/workspaces/:id/agents/:agentId/clone",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(cloneAgent)
);

/**
 * @openapi
 * /workspaces/{id}/agents/{agentId}/archive:
 *   post:
 *     summary: Archive Agent (Set status INACTIVE)
 *     tags:
 *       - Agent Management
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
 *         description: Agent archived
 */
router.post(
  "/workspaces/:id/agents/:agentId/archive",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(archiveAgent)
);

/**
 * @openapi
 * /workspaces/{id}/agents/{agentId}/versions:
 *   get:
 *     summary: List Agent Version History
 *     tags:
 *       - Agent Management
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
 *         description: Version history retrieved
 */
router.get(
  "/workspaces/:id/agents/:agentId/versions",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getAgentVersions)
);

export default router;
