import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createDeploymentSchema,
  updateDeploymentSchema,
  deploymentQuerySchema,
} from "../validators/deployment.validator";
import {
  createDeployment,
  getWorkspaceDeployments,
  getDeploymentDetails,
  updateDeployment,
  rollbackDeployment,
  deleteDeployment,
} from "../controllers/deployment.controller";

const router = Router();

// Top-level direct deployment endpoints
router.get("/deployments", authenticate, asyncHandler(getWorkspaceDeployments));
router.post("/deployments", authenticate, validate(createDeploymentSchema), asyncHandler(createDeployment));

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/deployments:
 *   post:
 *     summary: Deploy Agent to Environment
 *     tags:
 *       - Agent Deployments
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
 *               - agentId
 *             properties:
 *               agentId: { type: "string", format: "uuid", example: "11111111-1111-1111-1111-111111111111" }
 *               environment: { type: "string", enum: ["PRODUCTION", "STAGING", "DEVELOPMENT"], example: "PRODUCTION" }
 *               domain: { type: "string", example: "agent.acme.com" }
 *     responses:
 *       201:
 *         description: Agent deployed
 *   get:
 *     summary: List Workspace Deployments
 *     tags:
 *       - Agent Deployments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Deployments retrieved
 */
router.post(
  "/workspaces/:id/deployments",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(createDeploymentSchema),
  asyncHandler(createDeployment)
);

router.get(
  "/workspaces/:id/deployments",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(deploymentQuerySchema),
  asyncHandler(getWorkspaceDeployments)
);

/**
 * @openapi
 * /workspaces/{id}/deployments/{deploymentId}:
 *   get:
 *     summary: Get Deployment Details
 *     tags:
 *       - Agent Deployments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: deploymentId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Deployment details retrieved
 *   patch:
 *     summary: Update Deployment Status
 *     tags:
 *       - Agent Deployments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: deploymentId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Deployment updated
 *   delete:
 *     summary: Delete Deployment
 *     tags:
 *       - Agent Deployments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: deploymentId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Deployment deleted
 */
router.get(
  "/workspaces/:id/deployments/:deploymentId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getDeploymentDetails)
);

router.patch(
  "/workspaces/:id/deployments/:deploymentId",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(updateDeploymentSchema),
  asyncHandler(updateDeployment)
);

router.delete(
  "/workspaces/:id/deployments/:deploymentId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(deleteDeployment)
);

/**
 * @openapi
 * /workspaces/{id}/deployments/{deploymentId}/rollback:
 *   post:
 *     summary: Rollback Deployment to Previous Version
 *     tags:
 *       - Agent Deployments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: deploymentId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Deployment rolled back
 */
router.post(
  "/workspaces/:id/deployments/:deploymentId/rollback",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(rollbackDeployment)
);

export default router;
