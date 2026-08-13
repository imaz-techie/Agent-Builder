export type NotificationType =
  | "SYSTEM"
  | "AGENT"
  | "WORKSPACE"
  | "BILLING"
  | "TRAINING"
  | "DEPLOYMENT";

export type NotificationChannel = "IN_APP" | "EMAIL" | "WEBHOOK";

export interface AppNotification {
  id: string;
  userId: string;
  workspaceId: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  icon: string | null;
  link: string | null;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unread?: boolean;
  type?: NotificationType;
}

export interface NotificationPreference {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface UpdateNotificationPreferenceDto {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface UpdateNotificationPreferencesDto {
  preferences: UpdateNotificationPreferenceDto[];
}
