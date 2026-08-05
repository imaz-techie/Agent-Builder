# Implementation Plan - Phase 4: Agent Management System

This plan details the implementation of **Phase 4 (Agent Management System)** for the Agent Builder backend using Clean Architecture (Controllers, Services, Repositories, Validators, DTOs, Routes, and Tests).

---

## User Review Required

> [!IMPORTANT]
> - **Prisma Schema Expansion**: Adding `Agent` and `AgentVersion` models to `server/prisma/schema.prisma`.
> - **Agent Statuses**: Enums `DRAFT`, `TRAINING`, `ACTIVE`, `INACTIVE`, `DEPLOYING`.
> - **Base LLM Models**: Enums `GPT_4O`, `GPT_4O_MINI`, `CLAUDE_3_5_SONNET`, `CLAUDE_3_HAIKU`, `GEMINI_1_5_PRO`, `LLAMA_3_1_70B`.
> - **Search, Filters & Pagination**: Multi-field search (by name, description, tags, category), status filtering, and paginated responses (`page`, `limit`, `totalPages`, `totalItems`).
> - **Agent Cloning & Versioning**: Deep clone capabilities and version history snapshots (`AgentVersion`).

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add models & enums:
- `AgentStatus`: `DRAFT`, `TRAINING`, `ACTIVE`, `INACTIVE`, `DEPLOYING`.
- `LlmModel`: `GPT_4O`, `GPT_4O_MINI`, `CLAUDE_3_5_SONNET`, `CLAUDE_3_HAIKU`, `GEMINI_1_5_PRO`, `LLAMA_3_1_70B`.
- `Agent`: `id`, `name`, `description`, `category`, `tags` (string array), `status`, `currentVersion`, `model`, `temperature`, `maxTokens`, `systemPrompt`, `workspaceId`, `createdById`, `avatarColor`, `totalChats`, `lastTrainingAt`, timestamps.
- `AgentVersion`: `id`, `agentId`, `versionNumber`, `systemPrompt`, `model`, `temperature`, `maxTokens`, `changelog`, `createdById`, `createdAt`.

### 2. DTOs & Interfaces (`server/src/interfaces/agent.interface.ts`)
- `CreateAgentDTO`, `UpdateAgentDTO`, `AgentQueryParams`, `CloneAgentDTO`, `CreateAgentVersionDTO`, `AgentResponse`, `AgentVersionResponse`.

### 3. Validation Schemas (`server/src/validators/agent.validator.ts`)
Zod validation schemas for:
- `createAgentSchema`, `updateAgentSchema`, `agentQuerySchema`, `cloneAgentSchema`, `createVersionSchema`.

### 4. Repository Layer (`server/src/repositories/agent.repository.ts`)
Database access methods:
- `create`, `findById`, `findMany` (with filtering, search, pagination), `update`, `delete`, `archive`, `createVersion`, `getVersions`.

### 5. Service Layer (`server/src/services/agent.service.ts`)
Business logic:
- `createAgent`: Initialize agent and initial version record.
- `getWorkspaceAgents`: Filter, search, and paginate workspace agents.
- `getAgentById`: Fetch agent with current version details.
- `updateAgent`: Update agent parameters and auto-create version snapshot if prompt/model changes.
- `cloneAgent`: Duplicate agent configuration with custom new name.
- `archiveAgent`: Set status to `INACTIVE`.
- `deleteAgent`: Permanently delete agent and version history.

### 6. Controller & Routes (`server/src/controllers/agent.controller.ts` & `server/src/routes/agent.routes.ts`)
REST Endpoints:
- `POST /api/v1/workspaces/:workspaceId/agents` -> Create agent
- `GET /api/v1/workspaces/:workspaceId/agents` -> List/Search agents (supports `?search=`, `?category=`, `?status=`, `?page=`, `?limit=`)
- `GET /api/v1/workspaces/:workspaceId/agents/:id` -> Get agent details
- `PATCH /api/v1/workspaces/:workspaceId/agents/:id` -> Update agent configuration
- `POST /api/v1/workspaces/:workspaceId/agents/:id/clone` -> Clone agent
- `POST /api/v1/workspaces/:workspaceId/agents/:id/archive` -> Archive agent
- `DELETE /api/v1/workspaces/:workspaceId/agents/:id` -> Delete agent
- `GET /api/v1/workspaces/:workspaceId/agents/:id/versions` -> Get version history

### 7. Tests (`server/tests/agent.test.ts`)
Unit & integration test suite covering Agent CRUD, cloning, search filtering, and version history generation.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/agents` CRUD, cloning, search filters, and version management.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test creating an agent, editing system prompt (checking version creation), cloning agent, and searching by tag/name.
