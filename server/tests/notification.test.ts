import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { notificationRepository } from "../src/repositories/notification.repository";
import { NotificationChannel, NotificationType } from "@prisma/client";

jest.mock("../src/repositories/notification.repository");

describe("Phase 15 Notifications Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-111";
  const notificationId = "notif-uuid-222";
  const token = generateAccessToken({ userId, email: "dev@example.com", role: "DEVELOPER" });

  const mockNotification = {
    id: notificationId,
    userId,
    workspaceId: null,
    type: NotificationType.SYSTEM,
    title: "Welcome to Agent Builder",
    body: "Your workspace is ready.",
    icon: "bell",
    link: "/dashboard",
    readAt: null,
    metadata: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/v1/notifications should return paginated notifications", async () => {
    (notificationRepository.findUserNotifications as jest.Mock).mockResolvedValue({
      items: [mockNotification],
      totalItems: 1,
    });

    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notifications).toHaveLength(1);
    expect(res.body.meta.totalItems).toBe(1);
  });

  it("GET /api/v1/notifications/unread-count should return unread count", async () => {
    (notificationRepository.countUnread as jest.Mock).mockResolvedValue(3);

    const res = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.unreadCount).toBe(3);
  });

  it("POST /api/v1/notifications should create a notification", async () => {
    (notificationRepository.create as jest.Mock).mockResolvedValue(mockNotification);
    (notificationRepository.countUnread as jest.Mock).mockResolvedValue(1);

    const res = await request(app)
      .post("/api/v1/notifications")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId, title: "Welcome to Agent Builder" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notification.title).toBe("Welcome to Agent Builder");
  });

  it("PATCH /api/v1/notifications/:id/read should mark notification as read", async () => {
    (notificationRepository.markRead as jest.Mock).mockResolvedValue({ count: 1 });
    (notificationRepository.countUnread as jest.Mock).mockResolvedValue(0);

    const res = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(1);
  });

  it("POST /api/v1/notifications/read-all should mark all as read", async () => {
    (notificationRepository.markAllRead as jest.Mock).mockResolvedValue({ count: 5 });

    const res = await request(app)
      .post("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(5);
  });

  it("GET /api/v1/notifications/preferences should return preferences", async () => {
    (notificationRepository.findPreferences as jest.Mock).mockResolvedValue([
      { id: "pref-1", userId, type: NotificationType.BILLING, channel: NotificationChannel.EMAIL, enabled: true },
    ]);

    const res = await request(app)
      .get("/api/v1/notifications/preferences")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.preferences).toHaveLength(1);
  });

  it("PATCH /api/v1/notifications/preferences should update preferences", async () => {
    (notificationRepository.upsertPreference as jest.Mock).mockResolvedValue({
      id: "pref-1",
      userId,
      type: NotificationType.BILLING,
      channel: NotificationChannel.EMAIL,
      enabled: false,
    });

    const res = await request(app)
      .patch("/api/v1/notifications/preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        preferences: [
          { type: "BILLING", channel: "EMAIL", enabled: false },
          { type: "TRAINING", channel: "IN_APP", enabled: true },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(notificationRepository.upsertPreference).toHaveBeenCalledTimes(2);
  });

  it("DELETE /api/v1/notifications/:id should delete notification", async () => {
    (notificationRepository.delete as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete(`/api/v1/notifications/${notificationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(1);
  });
});
