import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";
import type {
  AppNotification,
  NotificationQueryParams,
  NotificationPreference,
  UpdateNotificationPreferencesDto,
} from "@/types/notification.types";

interface NotificationsResponse {
  notifications: AppNotification[];
}

interface UnreadCountResponse {
  unreadCount: number;
}

interface MarkReadResponse {
  read: number;
  unreadCount: number;
}

export const notificationService = {
  async getNotifications(params?: NotificationQueryParams): Promise<{
    notifications: AppNotification[];
    meta?: PaginationMeta;
  }> {
    const response = await apiClient.get<ApiResponse<NotificationsResponse, PaginationMeta>>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      { params }
    );
    return {
      notifications: response.data.data.notifications,
      meta: response.data.meta,
    };
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data.data.unreadCount;
  },

  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    const response = await apiClient.patch<ApiResponse<MarkReadResponse>>(
      API_ENDPOINTS.NOTIFICATIONS.READ(notificationId)
    );
    return response.data.data;
  },

  async markAllAsRead(): Promise<MarkReadResponse> {
    const response = await apiClient.patch<ApiResponse<MarkReadResponse>>(
      API_ENDPOINTS.NOTIFICATIONS.READ_ALL
    );
    return response.data.data;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DETAIL(notificationId));
  },

  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await apiClient.get<ApiResponse<{ preferences: NotificationPreference[] }>>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return response.data.data.preferences;
  },

  async updatePreferences(
    dto: UpdateNotificationPreferencesDto
  ): Promise<NotificationPreference[]> {
    const response = await apiClient.patch<ApiResponse<{ preferences: NotificationPreference[] }>>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      dto
    );
    return response.data.data.preferences;
  },
};
