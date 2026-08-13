# Implementation Plan - Phase 15: Notifications

This plan details the implementation of **Phase 15 (In-app notification center, unread tracking, mark-as-read flow, and per-type/channel notification preferences)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Notification Center**: User-scoped notifications (SYSTEM, AGENT, WORKSPACE, BILLING, TRAINING, DEPLOYMENT) with pagination, unread filtering, and type filtering.
> - **Unread Tracking**: `unread-count` endpoint and read timestamps.
> - **Real-Time Delivery**: New notifications emit `notification:new` to the target user over Socket.IO (with updated unread count).
> - **Preferences**: Per-type × per-channel (IN_APP, EMAIL, WEBHOOK) enabled flags via unique compound key.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
- `NotificationType` / `NotificationChannel` enums.
- `Notification`: userId, workspaceId?, type, title, body, icon, link, readAt, metadata; indexed on `[userId, readAt]`.
- `NotificationPreference`: unique `[userId, type, channel]`, enabled flag.

### 2. DTOs & Interfaces (`server/src/interfaces/notification.interface.ts`)
- `CreateNotificationDTO`, `NotificationQueryParams`, `NotificationPreferenceDTO`, `UpdateNotificationPreferencesDTO`.

### 3. Validation Schemas (`server/src/validators/notification.validator.ts`)
- Zod schemas for creation, query params, and preference updates.

### 4. Repository Layer (`server/src/repositories/notification.repository.ts`)
- Create, find-by-id, paginated user notifications, unread count, mark read / mark-all-read, delete, preferences read/upsert.

### 5. Service Layer (`server/src/services/notification.service.ts`)
- Creation with real-time broadcast, listing, unread count, detail, mark read, mark all read, delete, preferences get/update.

### 6. Controller & Routes (`server/src/controllers/notification.controller.ts` & `server/src/routes/notification.routes.ts`)
REST Endpoints (auth-scoped to `req.user.id`, preferences routes registered before `/:id` to avoid route shadowing):
- `GET/POST /notifications`, `GET /notifications/unread-count`, `POST /notifications/read-all`
- `GET/PATCH/DELETE /notifications/:id`, `PATCH /notifications/:id/read`
- `GET/PATCH /notifications/preferences`

### 7. Tests (`server/tests/notification.test.ts`)
- Listing, unread count, creation, mark read, read-all, preferences get/update, delete.

---

## Verification Plan

### Automated Tests
1. Execute Jest test suite: `npm test` verifying notification endpoints.
2. Verify `npm run build` compiles clean.

### Manual Verification
- Create a notification for a user, confirm the unread badge count, mark it read, and observe the `notification:new` Socket.IO event for that user.
- Toggle a preference (e.g., BILLING + EMAIL off) and re-read preferences.
