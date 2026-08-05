import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";
import {
  adminUserQuerySchema,
  adminWorkspaceQuerySchema,
  updateAdminUserSchema,
  systemLogQuerySchema,
} from "../validators/admin.validator";
import {
  getPlatformStats,
  getUsers,
  updateUser,
  deleteUser,
  getWorkspaces,
  getSystemLogs,
  getTelemetry,
} from "../controllers/admin.controller";

const router = Router();

router.use("/admin", authenticate, authorize([Role.ADMIN]));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Get platform-wide statistics (users, workspaces, agents, tokens, spend)
 *     tags:
 *       - Admin Platform
 */
router.get("/admin/stats", asyncHandler(getPlatformStats));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List, search, filter, and paginate all platform users
 *     tags:
 *       - Admin Platform
 */
router.get(
  "/admin/users",
  validate(adminUserQuerySchema),
  asyncHandler(getUsers)
);

/**
 * @openapi
 * /admin/users/{userId}:
 *   patch:
 *     summary: Update a user's role or verification status
 *     tags:
 *       - Admin Platform
 *   delete:
 *     summary: Delete a platform user permanently
 *     tags:
 *       - Admin Platform
 */
router.patch(
  "/admin/users/:userId",
  validate(updateAdminUserSchema),
  asyncHandler(updateUser)
);

router.delete("/admin/users/:userId", asyncHandler(deleteUser));

/**
 * @openapi
 * /admin/workspaces:
 *   get:
 *     summary: List, search, and paginate all platform workspaces
 *     tags:
 *       - Admin Platform
 */
router.get(
  "/admin/workspaces",
  validate(adminWorkspaceQuerySchema),
  asyncHandler(getWorkspaces)
);

/**
 * @openapi
 * /admin/system/logs:
 *   get:
 *     summary: Retrieve recent system log entries
 *     tags:
 *       - Admin Platform
 * /admin/telemetry:
 *   get:
 *     summary: Get system telemetry (uptime, memory, database status)
 *     tags:
 *       - Admin Platform
 */
router.get(
  "/admin/system/logs",
  validate(systemLogQuerySchema),
  asyncHandler(getSystemLogs)
);

router.get("/admin/telemetry", asyncHandler(getTelemetry));

export default router;
