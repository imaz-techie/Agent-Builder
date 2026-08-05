import { NotificationType, NotificationChannel } from "@prisma/client";

export interface CreateNotificationDTO {
  userId: string;
  workspaceId?: string;
  type?: NotificationType;
  title: string;
  body?: string;
  icon?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationQueryParams {
  page?: string;
  limit?: string;
  unread?: string;
  type?: NotificationType;
}

export interface NotificationPreferenceDTO {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface UpdateNotificationPreferencesDTO {
  preferences: NotificationPreferenceDTO[];
}
