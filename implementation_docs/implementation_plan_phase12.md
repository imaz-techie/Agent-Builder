# Implementation Plan - Phase 12: Deployment Manager & Embed Widget

This plan details the implementation of **Phase 12 (Deployment Manager with environment targeting, version tracking, rollbacks, and Embeddable Chat Widget with public endpoints)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Deployment Manager**: Deploy agent versions to `PRODUCTION`, `STAGING`, or `DEVELOPMENT` environments with status tracking (`ACTIVE`, `INACTIVE`, `FAILED`, `ROLLED_BACK`) and one-click rollback to the previous deployment.
> - **Embed Widget**: Per-agent chat widget configuration (title, welcome message, theme, primary color, launcher position/size, avatar, RAG toggle) with publish lifecycle and security token.
> - **Public Endpoints**: Token-based public `config` and `chat` endpoints so external websites can embed agents with no authentication.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
- `DeploymentEnvironment` / `DeploymentStatus` enums.
- `AgentDeployment`: agentId, workspaceId, environment, status, versionNumber, url, domain, deployedById.
- `WidgetTheme` / `WidgetLauncherPosition` enums.
- `ChatWidgetConfig`: agentId (unique), workspaceId, appearance fields, isPublished, unique `widgetToken`, customDomain.

### 2. DTOs & Interfaces (`server/src/interfaces/deployment.interface.ts`, `server/src/interfaces/widget.interface.ts`)
- `CreateDeploymentDTO`, `UpdateDeploymentDTO`, `DeploymentQueryParams`.
- `UpsertWidgetConfigDTO`, `PublicWidgetConfigResponse`.

### 3. Validation Schemas (`server/src/validators/deployment.validator.ts`, `server/src/validators/widget.validator.ts`)
- Zod schemas for deployment create/update/query, widget upsert (hex color regex), and public widget chat body.

### 4. Repository Layer (`server/src/repositories/deployment.repository.ts`, `server/src/repositories/widget.repository.ts`)
- Deployment: create, paginated list with filters, previous-deployment lookup, set-all-inactive, update, delete, count.
- Widget: upsert, find by agent / id / published token, update, delete, count.

### 5. Service Layer (`server/src/services/deployment.service.ts`, `server/src/services/widget.service.ts`)
- Deployment: enforce one active deployment per agent+environment, rollback flow, audit logging.
- Widget: token generation (`wgt_` prefix), publish/regenerate token, sanitized public config, session reuse + widget chat via `chatService`.

### 6. Controller & Routes (`server/src/controllers/deployment.controller.ts`, `server/src/controllers/widget.controller.ts` & routes)
REST Endpoints:
- `POST/GET /workspaces/:id/deployments`, `GET/PATCH/DELETE /workspaces/:id/deployments/:deploymentId`, `POST /workspaces/:id/deployments/:deploymentId/rollback`
- `PUT/GET /workspaces/:id/agents/:agentId/widget`, `PATCH/DELETE /workspaces/:id/widgets/:widgetId`, `POST /workspaces/:id/widgets/:widgetId/publish`, `POST /workspaces/:id/widgets/:widgetId/token`
- `GET /public/widgets/:token/config`, `POST /public/widgets/:token/chat`

### 7. Tests (`server/tests/deployment.test.ts`, `server/tests/widget.test.ts`)
- Unit & integration tests covering deploy, list/filter, details, update, rollback, delete, widget upsert/get/publish/token rotation, public config, and public chat.

---

## Verification Plan

### Automated Tests
1. Execute Jest test suite: `npm test` verifying deployment and widget endpoints.
2. Verify `npm run build` compiles clean.

### Manual Verification
- Deploy an agent to an environment, roll it back, confirm previous version restored and current marked `ROLLED_BACK`.
- Publish a widget, fetch the public config via token, and send a public chat message reusing a session.
