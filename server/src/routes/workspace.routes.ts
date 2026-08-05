import { Router } from "express";
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceDetails,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember,
} from "../controllers/workspace.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "../validators/workspace.validator";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces:
 *   post:
 *     summary: Create Workspace
 *     description: Creates a new workspace and sets current user as OWNER.
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name: { type: "string", example: "Acme AI Labs" }
 *               slug: { type: "string", example: "acme-ai-labs" }
 *     responses:
 *       201:
 *         description: Workspace created
 *   get:
 *     summary: List User Workspaces
 *     description: Returns all workspaces current user has access to.
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspaces retrieved
 */
router.post(
  "/workspaces",
  validate(createWorkspaceSchema),
  asyncHandler(createWorkspace)
);

router.get("/workspaces", asyncHandler(getUserWorkspaces));

/**
 * @openapi
 * /workspaces/{id}:
 *   get:
 *     summary: Get Workspace Details
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Workspace details retrieved
 *   patch:
 *     summary: Update Workspace
 *     tags:
 *       - Workspaces
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
 *             properties:
 *               name: { type: "string", example: "Updated Acme Labs" }
 *     responses:
 *       200:
 *         description: Workspace updated
 *   delete:
 *     summary: Delete Workspace
 *     tags:
 *       - Workspaces
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Workspace deleted
 */
router.get(
  "/workspaces/:id",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWorkspaceDetails)
);

router.patch(
  "/workspaces/:id",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(updateWorkspaceSchema),
  asyncHandler(updateWorkspace)
);

router.delete(
  "/workspaces/:id",
  requireWorkspaceMember(WorkspaceRole.OWNER),
  asyncHandler(deleteWorkspace)
);

/**
 * Member Management
 */
router.post(
  "/workspaces/:id/invites",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(inviteMemberSchema),
  asyncHandler(inviteMember)
);

router.patch(
  "/workspaces/:id/members/:userId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(updateMemberRoleSchema),
  asyncHandler(updateMemberRole)
);

router.delete(
  "/workspaces/:id/members/:userId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(removeMember)
);

export default router;
