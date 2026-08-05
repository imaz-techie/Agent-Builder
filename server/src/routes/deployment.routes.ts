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

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/deployments:
 *   post:
 *     summary: Deploy an agent version to an environment
 *     tags:
 *       - Deployment Manager
 *   get:
 *     summary: List, filter, and paginate workspace deployments
 *     tags:
 *       - Deployment Manager
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
 *     summary: Get deployment details
 *     tags:
 *       - Deployment Manager
 *   patch:
 *     summary: Update deployment status, URL, or domain
 *     tags:
 *       - Deployment Manager
 *   delete:
 *     summary: Delete a deployment record
 *     tags:
 *       - Deployment Manager
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
 *     summary: Roll back an agent deployment to the previous version
 *     tags:
 *       - Deployment Manager
 */
router.post(
  "/workspaces/:id/deployments/:deploymentId/rollback",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(rollbackDeployment)
);

export default router;
