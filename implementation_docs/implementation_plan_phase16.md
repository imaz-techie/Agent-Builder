# Implementation Plan - Phase 16: Admin & Platform Management

This plan details the implementation of **Phase 16 (Platform-wide administration: statistics, user management, workspace oversight, system logs, and telemetry)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Admin Guard**: All endpoints require JWT auth and `Role.ADMIN` via the `authorize` middleware.
> - **Platform Stats**: User/workspace/agent counts, active agents, total chat messages, total tokens, total platform spend, knowledge files, training jobs, API keys, plus live system info.
> - **User Management**: Searchable/paginated user list, role & verification updates, permanent deletion.
> - **Workspace Oversight**: Searchable/paginated workspace list with member/agent counts.
> - **System Logs & Telemetry**: Recent `SystemLog` entries (level-filterable) and runtime telemetry (uptime, memory, Node version, DB status).

---

## Proposed Changes & Clean Architecture Breakdown

### 1. DTOs & Interfaces (`server/src/interfaces/admin.interface.ts`)
- `AdminUserQueryParams`, `AdminWorkspaceQueryParams`, `UpdateAdminUserDTO`, `PlatformStats`, `SystemTelemetry`.

### 2. Validation Schemas (`server/src/validators/admin.validator.ts`)
- Zod schemas for user/workspace query params, admin user update, and system log query.

### 3. Repository Layer (`server/src/repositories/admin.repository.ts`)
- Platform stats via parallel `count`/`aggregate` queries, total spend aggregation, user find/update/delete, workspace find with `_count`, system log find/create.

### 4. Service Layer (`server/src/services/admin.service.ts`)
- Stats composition (system block: Node version, platform, uptime, memory, DB status), user/workspace pagination, update/delete user, system logs, telemetry.

### 5. Controller & Routes (`server/src/controllers/admin.controller.ts` & `server/src/routes/admin.routes.ts`)
REST Endpoints (path-scoped `router.use("/admin", authenticate, authorize([Role.ADMIN]))`):
- `GET /admin/stats`
- `GET /admin/users`, `PATCH/DELETE /admin/users/:userId`
- `GET /admin/workspaces`
- `GET /admin/system/logs`, `GET /admin/telemetry`

### 6. Tests (`server/tests/admin.test.ts`)
- Stats retrieval, non-admin 403 guard, user list/update/delete, workspace list, system logs, telemetry.

---

## Verification Plan

### Automated Tests
1. Execute Jest test suite: `npm test` verifying admin endpoints and role guard.
2. Verify `npm run build` compiles clean.

### Manual Verification
- As an ADMIN user, fetch platform stats, search users, update a user's role, list workspaces, and read system telemetry.
- As a non-admin (DEVELOPER), confirm all `/admin` endpoints return `403`.
