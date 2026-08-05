import { Router } from "express";
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
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceDetails,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  acceptInvite,
  updateMemberRole,
  removeMember,
  getAuditLogs,
} from "../controllers/workspace.controller";

const router = Router();

// Apply global Bearer token authentication to workspace routes
router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags:
 *       - Workspaces
 *   get:
 *     summary: List user's accessible workspaces
 *     tags:
 *       - Workspaces
 */
router.post("/workspaces", validate(createWorkspaceSchema), asyncHandler(createWorkspace));
router.get("/workspaces", asyncHandler(getUserWorkspaces));

/**
 * @openapi
 * /workspaces/invites/{token}/accept:
 *   post:
 *     summary: Accept workspace invitation
 *     tags:
 *       - Workspaces
 */
router.post("/workspaces/invites/:token/accept", asyncHandler(acceptInvite));

/**
 * @openapi
 * /workspaces/{id}:
 *   get:
 *     summary: Get workspace details and member roster
 *   patch:
 *     summary: Update workspace name/logo
 *   delete:
 *     summary: Delete workspace (Owner only)
 */
router.get("/workspaces/:id", requireWorkspaceMember(WorkspaceRole.VIEWER), asyncHandler(getWorkspaceDetails));
router.patch("/workspaces/:id", requireWorkspaceMember(WorkspaceRole.ADMIN), validate(updateWorkspaceSchema), asyncHandler(updateWorkspace));
router.delete("/workspaces/:id", requireWorkspaceMember(WorkspaceRole.OWNER), asyncHandler(deleteWorkspace));

/**
 * Team Membership & Invitations
 */
router.post("/workspaces/:id/invites", requireWorkspaceMember(WorkspaceRole.ADMIN), validate(inviteMemberSchema), asyncHandler(inviteMember));
router.patch("/workspaces/:id/members/:userId", requireWorkspaceMember(WorkspaceRole.OWNER), validate(updateMemberRoleSchema), asyncHandler(updateMemberRole));
router.delete("/workspaces/:id/members/:userId", requireWorkspaceMember(WorkspaceRole.ADMIN), asyncHandler(removeMember));

/**
 * Audit Logs
 */
router.get("/workspaces/:id/audit-logs", requireWorkspaceMember(WorkspaceRole.ADMIN), asyncHandler(getAuditLogs));

export default router;
