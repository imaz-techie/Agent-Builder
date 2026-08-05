import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";
import {
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

// Require Super Admin role for all platform administration endpoints
router.use("/admin", authenticate, authorize([Role.ADMIN]));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Get Platform-Wide System Telemetry Stats
 *     tags:
 *       - Platform Super Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics retrieved
 */
router.get("/admin/stats", asyncHandler(getPlatformStats));

/**
 * @openapi
 * /admin/telemetry:
 *   get:
 *     summary: Get System Real-Time Telemetry
 *     tags:
 *       - Platform Super Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Telemetry data retrieved
 */
router.get("/admin/telemetry", asyncHandler(getTelemetry));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List All Users Across Platform
 *     tags:
 *       - Platform Super Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users list retrieved
 */
router.get("/admin/users", asyncHandler(getUsers));

/**
 * @openapi
 * /admin/users/{userId}:
 *   patch:
 *     summary: Update User Global Role / Profile
 *     tags:
 *       - Platform Super Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
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
 *               role: { type: "string", enum: ["ADMIN", "DEVELOPER", "VIEWER", "WORKSPACE_OWNER"], example: "ADMIN" }
 *               isVerified: { type: "boolean", example: true }
 *     responses:
 *       200:
 *         description: User role updated
 *   delete:
 *     summary: Delete User
 *     tags:
 *       - Platform Super Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.patch(
  "/admin/users/:userId",
  validate(updateAdminUserSchema),
  asyncHandler(updateUser)
);

router.patch(
  "/admin/users/:userId/role",
  validate(updateAdminUserSchema),
  asyncHandler(updateUser)
);

router.delete(
  "/admin/users/:userId",
  asyncHandler(deleteUser)
);

/**
 * @openapi
 * /admin/workspaces:
 *   get:
 *     summary: List All Platform Workspaces
 *     tags:
 *       - Platform Super Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All workspaces list retrieved
 */
router.get("/admin/workspaces", asyncHandler(getWorkspaces));

/**
 * @openapi
 * /admin/logs:
 *   get:
 *     summary: Query Platform System Event Logs
 *     tags:
 *       - Platform Super Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System logs retrieved
 */
router.get(
  "/admin/logs",
  validate(systemLogQuerySchema),
  asyncHandler(getSystemLogs)
);

router.get(
  "/admin/system/logs",
  validate(systemLogQuerySchema),
  asyncHandler(getSystemLogs)
);

export default router;
