import { notificationRepository } from "../repositories/notification.repository";
import { realtimeService } from "../realtime";
import { ApiError } from "../utils/apiError";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import {
  CreateNotificationDTO,
  NotificationQueryParams,
  UpdateNotificationPreferencesDTO,
} from "../interfaces/notification.interface";

export class NotificationService {
  async createNotification(dto: CreateNotificationDTO) {
    const notification = await notificationRepository.create(dto);

    realtimeService.emitToUser(dto.userId, "notification:new", {
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link,
        createdAt: notification.createdAt,
      },
      unreadCount: await notificationRepository.countUnread(dto.userId),
    });

    return notification;
  }

  async getUserNotifications(userId: string, queryParams: NotificationQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await notificationRepository.findUserNotifications(userId, {
      unreadOnly: queryParams.unread === "true",
      type: queryParams.type,
      skip,
      take: limit,
    });

    return formatPaginatedResult(items, totalItems, { page, limit, skip });
  }

  async getUnreadCount(userId: string) {
    return { unreadCount: await notificationRepository.countUnread(userId) };
  }

  async getNotificationDetails(id: string, userId: string) {
    const notification = await notificationRepository.findById(id, userId);
    if (!notification) {
      throw ApiError.notFound("Notification not found");
    }
    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const result = await notificationRepository.markRead(id, userId);
    if (result.count === 0) {
      throw ApiError.notFound("Notification not found or already read");
    }
    return { read: result.count, unreadCount: await notificationRepository.countUnread(userId) };
  }

  async markAllAsRead(userId: string) {
    const result = await notificationRepository.markAllRead(userId);
    return { read: result.count, unreadCount: 0 };
  }

  async deleteNotification(id: string, userId: string) {
    const result = await notificationRepository.delete(id, userId);
    if (result.count === 0) {
      throw ApiError.notFound("Notification not found");
    }
    return { deleted: result.count };
  }

  async getPreferences(userId: string) {
    return notificationRepository.findPreferences(userId);
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDTO) {
    const results = [];
    for (const pref of dto.preferences) {
      results.push(
        await notificationRepository.upsertPreference(userId, pref.type, pref.channel, pref.enabled)
      );
    }
    return results;
  }
}

export const notificationService = new NotificationService();
