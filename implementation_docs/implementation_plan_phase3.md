# Implementation Plan - Phase 3: Workspace System & API Keys

This plan details the implementation of **Phase 3 (Workspace System, Team Members, Member Invitations, Activity Audit Logs, and API Key Management)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Prisma Schema Expansion**: Adding `WorkspaceInvite` and `ApiKey` models to `server/prisma/schema.prisma`.
> - **Multi-Tenancy & Workspace Context Middleware**: Header `X-Workspace-Id` or route parameter for workspace scoping, validated via `requireWorkspaceMember(role)`.
> - **API Key Permissions**: Scoped permission keys (`read`, `write`, `admin`) with hashed key storage (`keyHash`, `keyPrefix`) and last-used tracking.
> - **Frontend Compatibility**: Existing frontend billing/settings/team UI remains unchanged and will connect to backend API endpoints seamlessly.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add models:
- `WorkspaceInvite`: Email, workspaceId, role (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`), invitation token, expiresAt, status (`PENDING`, `ACCEPTED`, `EXPIRED`).
- `ApiKey`: Name, keyPrefix (visible e.g. `ag_live_...`), keyHash (hashed secret), workspaceId, createdById, permissions (`read`, `write`, `admin`), lastUsedAt, expiresAt.

### 2. DTOs & Interfaces (`server/src/interfaces/workspace.interface.ts`)
- `CreateWorkspaceDTO`, `UpdateWorkspaceDTO`, `InviteMemberDTO`, `UpdateMemberRoleDTO`, `CreateApiKeyDTO`, `ApiKeyResponse`.

### 3. Validation Schemas (`server/src/validators/workspace.validator.ts`)
Zod validation schemas for:
- `createWorkspaceSchema`, `updateWorkspaceSchema`, `inviteMemberSchema`, `createApiKeySchema`.

### 4. Repositories
- `server/src/repositories/workspace.repository.ts`: CRUD operations for workspaces, members, invites, and audit log entries.
- `server/src/repositories/apiKey.repository.ts`: CRUD operations for API keys.

### 5. Services
- `server/src/services/workspace.service.ts`: Workspace management, member role updates, invitation flows, and audit log tracking.
- `server/src/services/apiKey.service.ts`: Secure API key generation (`crypto.randomBytes`), key hashing (SHA-256), and key revocation.

### 6. Middlewares (`server/src/middlewares/workspace.middleware.ts`)
- `requireWorkspaceMember(requiredRole)`: Validates user membership in target workspace and enforces role access (`OWNER` > `ADMIN` > `MEMBER` > `VIEWER`).

### 7. Controllers & Routes
- `server/src/controllers/workspace.controller.ts` & `server/src/routes/workspace.routes.ts`:
  - `POST /api/v1/workspaces`: Create new workspace
  - `GET /api/v1/workspaces`: List user's workspaces
  - `GET /api/v1/workspaces/:id`: Get workspace details
  - `PATCH /api/v1/workspaces/:id`: Update workspace settings
  - `DELETE /api/v1/workspaces/:id`: Delete/Archive workspace
  - `GET /api/v1/workspaces/:id/members`: List members
  - `POST /api/v1/workspaces/:id/invites`: Invite member
  - `PATCH /api/v1/workspaces/:id/members/:userId`: Update member role
  - `DELETE /api/v1/workspaces/:id/members/:userId`: Remove member
  - `GET /api/v1/workspaces/:id/audit-logs`: Get activity audit logs
- `server/src/controllers/apiKey.controller.ts` & `server/src/routes/apiKey.routes.ts`:
  - `POST /api/v1/workspaces/:id/api-keys`: Generate API key
  - `GET /api/v1/workspaces/:id/api-keys`: List workspace API keys
  - `DELETE /api/v1/workspaces/:id/api-keys/:keyId`: Revoke API key

### 8. Tests (`server/tests/workspace.test.ts`)
Unit & integration tests for workspace CRUD, team invitations, member role checks, audit logs, and API key generation/revocation.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/workspaces` endpoints, role enforcement, and `/api-keys` operations.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test creating a workspace, inviting a member, listing audit logs, and generating an API secret key.
