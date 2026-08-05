import { z } from "zod";
import { NotificationType, NotificationChannel } from "@prisma/client";

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
    workspaceId: z.string().optional(),
    type: z.nativeEnum(NotificationType).optional(),
    title: z.string().min(1, "Title is required").max(200),
    body: z.string().max(2000).optional(),
    icon: z.string().max(50).optional(),
    link: z.string().max(500).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const notificationQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    unread: z.enum(["true", "false"]).optional(),
    type: z.nativeEnum(NotificationType).optional(),
  }),
});

export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    preferences: z
      .array(
        z.object({
          type: z.nativeEnum(NotificationType),
          channel: z.nativeEnum(NotificationChannel),
          enabled: z.boolean(),
        })
      )
      .min(1),
  }),
});
