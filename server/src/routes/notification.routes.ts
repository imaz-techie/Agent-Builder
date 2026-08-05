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
  getNotificationDetails,
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
 *   get:
 *     summary: List current user's notifications (paginated, filterable)
 *     tags:
 *       - Notifications
 *   post:
 *     summary: Create a notification for a user
 *     tags:
 *       - Notifications
 */
router.get(
  "/notifications",
  validate(notificationQuerySchema),
  asyncHandler(getUserNotifications)
);

router.post(
  "/notifications",
  validate(createNotificationSchema),
  asyncHandler(createNotification)
);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     summary: Get current user's unread notification count
 *     tags:
 *       - Notifications
 * /notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     tags:
 *       - Notifications
 */
router.get("/notifications/unread-count", asyncHandler(getUnreadCount));

router.post("/notifications/read-all", asyncHandler(markAllAsRead));

/**
 * @openapi
 * /notifications/preferences:
 *   get:
 *     summary: Get current user's notification preferences
 *     tags:
 *       - Notifications
 *   patch:
 *     summary: Update notification preferences
 *     tags:
 *       - Notifications
 */
router.get("/notifications/preferences", asyncHandler(getPreferences));

router.patch(
  "/notifications/preferences",
  validate(updateNotificationPreferencesSchema),
  asyncHandler(updatePreferences)
);

/**
 * @openapi
 * /notifications/{id}:
 *   get:
 *     summary: Get notification details
 *     tags:
 *       - Notifications
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags:
 *       - Notifications
 */
router.get("/notifications/:id", asyncHandler(getNotificationDetails));

router.patch("/notifications/:id/read", asyncHandler(markAsRead));

router.delete("/notifications/:id", asyncHandler(deleteNotification));

export default router;
