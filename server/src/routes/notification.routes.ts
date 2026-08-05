import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createNotificationSchema,
  notificationQuerySchema,
  updateNotificationPreferencesSchema,
} from "../validators/notification.validator";
import {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from "../controllers/notification.controller";

const router = Router();

router.use("/notifications", authenticate);

/**
 * @openapi
 * /notifications:
 *   post:
 *     summary: Create User Notification
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *             properties:
 *               userId: { type: "string", example: "user-uuid-111" }
 *               title: { type: "string", example: "Welcome to Agent Builder" }
 *     responses:
 *       201:
 *         description: Notification created
 *   get:
 *     summary: Get User Notifications
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list retrieved
 */
router.post(
  "/notifications",
  validate(createNotificationSchema),
  asyncHandler(createNotification)
);

router.get(
  "/notifications",
  validate(notificationQuerySchema),
  asyncHandler(getUserNotifications)
);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     summary: Get Unread Notification Count
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count retrieved
 */
router.get("/notifications/unread-count", asyncHandler(getUnreadCount));

/**
 * @openapi
 * /notifications/read-all:
 *   post:
 *     summary: Mark All Notifications as Read (POST)
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *   patch:
 *     summary: Mark All Notifications as Read (PATCH)
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */
router.post("/notifications/read-all", asyncHandler(markAllAsRead));
router.patch("/notifications/read-all", asyncHandler(markAllAsRead));

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark Single Notification as Read
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch("/notifications/:id/read", asyncHandler(markAsRead));

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete Notification
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete("/notifications/:id", asyncHandler(deleteNotification));

/**
 * @openapi
 * /notifications/preferences:
 *   get:
 *     summary: Get Notification Channel Preferences
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved
 *   patch:
 *     summary: Update Notification Channel Preference
 *     tags:
 *       - Notifications & Preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferences
 *             properties:
 *               preferences:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type: { type: "string", enum: ["SYSTEM", "AGENT", "WORKSPACE", "BILLING", "TRAINING", "DEPLOYMENT"], example: "TRAINING" }
 *                     channel: { type: "string", enum: ["IN_APP", "EMAIL", "WEBHOOK"], example: "EMAIL" }
 *                     enabled: { type: "boolean", example: true }
 *     responses:
 *       200:
 *         description: Preference updated
 */
router.get("/notifications/preferences", asyncHandler(getPreferences));

router.patch(
  "/notifications/preferences",
  validate(updateNotificationPreferencesSchema),
  asyncHandler(updatePreferences)
);

export default router;
