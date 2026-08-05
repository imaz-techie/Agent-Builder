import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function createNotification(req: Request, res: Response) {
  const notification = await notificationService.createNotification(req.body);

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Notification created successfully",
    data: { notification },
  });
}

export async function getUserNotifications(req: Request, res: Response) {
  const result = await notificationService.getUserNotifications(req.user!.id, req.query);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Notifications retrieved",
    data: { notifications: result.items },
    meta: result.meta,
  });
}

export async function getUnreadCount(req: Request, res: Response) {
  const result = await notificationService.getUnreadCount(req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Unread notification count retrieved",
    data: result,
  });
}

export async function getNotificationDetails(req: Request, res: Response) {
  const param = req.params.id;
  const id = Array.isArray(param) ? param[0] : param;

  const notification = await notificationService.getNotificationDetails(id, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Notification details retrieved",
    data: { notification },
  });
}

export async function markAsRead(req: Request, res: Response) {
  const param = req.params.id;
  const id = Array.isArray(param) ? param[0] : param;

  const result = await notificationService.markAsRead(id, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Notification marked as read",
    data: result,
  });
}

export async function markAllAsRead(req: Request, res: Response) {
  const result = await notificationService.markAllAsRead(req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "All notifications marked as read",
    data: result,
  });
}

export async function deleteNotification(req: Request, res: Response) {
  const param = req.params.id;
  const id = Array.isArray(param) ? param[0] : param;

  const result = await notificationService.deleteNotification(id, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Notification deleted successfully",
    data: result,
  });
}

export async function getPreferences(req: Request, res: Response) {
  const preferences = await notificationService.getPreferences(req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Notification preferences retrieved",
    data: { preferences },
  });
}

export async function updatePreferences(req: Request, res: Response) {
  const preferences = await notificationService.updatePreferences(req.user!.id, req.body);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Notification preferences updated successfully",
    data: { preferences },
  });
}
