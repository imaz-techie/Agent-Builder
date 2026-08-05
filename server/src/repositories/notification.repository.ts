import { prisma } from "../database";
import { NotificationChannel, NotificationType } from "@prisma/client";
import { CreateNotificationDTO } from "../interfaces/notification.interface";

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  skip: number;
  take: number;
}

export class NotificationRepository {
  async create(data: CreateNotificationDTO) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        workspaceId: data.workspaceId || null,
        type: data.type || NotificationType.SYSTEM,
        title: data.title,
        body: data.body,
        icon: data.icon,
        link: data.link,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
      },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  async findUserNotifications(userId: string, filters: NotificationFilters) {
    const where: Record<string, unknown> = { userId };
    if (filters.unreadOnly) where.readAt = null;
    if (filters.type) where.type = filters.type;

    const [items, totalItems] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, totalItems };
  }

  async countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  async findPreferences(userId: string) {
    return prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  async upsertPreference(userId: string, type: NotificationType, channel: NotificationChannel, enabled: boolean) {
    return prisma.notificationPreference.upsert({
      where: {
        userId_type_channel: { userId, type, channel },
      },
      create: { userId, type, channel, enabled },
      update: { enabled },
    });
  }
}

export const notificationRepository = new NotificationRepository();
