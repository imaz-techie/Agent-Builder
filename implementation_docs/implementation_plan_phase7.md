# Implementation Plan - Phase 7: Prompt Studio & Playground

This plan details the implementation of **Phase 7 (Prompt Studio, Prompt Template Library, Dynamic Variables, Output Comparison Engine, Execution History, and Versioning)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Prisma Schema Expansion**: Adding `PromptTemplate` and `PromptExecution` models to `server/prisma/schema.prisma`.
> - **Dynamic Variables Extraction**: Automatic parsing of prompt variables formatted as `{{variable_name}}` in prompt text.
> - **Output Comparison Engine**: Side-by-side execution testing of multiple prompts/models simultaneously for prompt evaluation.
> - **Execution History & Metrics**: Storing latency, token count, inputs/variables used, and response output in `PromptExecution`.
> - **Frontend Integration**: Aligns with [PromptStudioPage.tsx](file:///d:/Imaz/Imaz%20Projects/Agent%20Builder/src/pages/PromptStudioPage.tsx) so templates, variable extraction, playground test runs, side-by-side output comparisons, and version history operate smoothly when `VITE_USE_API=true`.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add models:
- `PromptTemplate`: `id`, `title`, `description`, `category`, `systemPrompt`, `userPromptTemplate`, `variables` (string array), `model`, `temperature`, `maxTokens`, `isPublic`, `workspaceId`, `createdById`, timestamps.
- `PromptExecution`: `id`, `templateId`, `agentId`, `systemPrompt`, `userPrompt`, `variablesUsed` (JSON), `model`, `outputContent`, `latencyMs`, `tokensUsed`, `workspaceId`, `createdById`, timestamps.

### 2. DTOs & Interfaces (`server/src/interfaces/prompt.interface.ts`)
- `CreatePromptTemplateDTO`, `UpdatePromptTemplateDTO`, `ExecutePromptDTO`, `ComparePromptsDTO`, `PromptTemplateResponse`, `PromptExecutionResponse`.

### 3. Validation Schemas (`server/src/validators/prompt.validator.ts`)
Zod validation schemas for:
- `createTemplateSchema`, `updateTemplateSchema`, `executePromptSchema`, `comparePromptsSchema`.

### 4. Repository Layer (`server/src/repositories/prompt.repository.ts`)
Database access methods:
- `createTemplate`, `findTemplateById`, `findTemplatesByWorkspace`, `updateTemplate`, `deleteTemplate`, `createExecution`, `getExecutionsByWorkspace`.

### 5. Service Layer (`server/src/services/prompt.service.ts`)
Business logic:
- `extractVariables`: Utility helper parsing `{{var}}` patterns from template strings.
- `createTemplate`: Create new prompt template with extracted variables.
- `executePrompt`: Run single prompt test with variable substitution, timing latency, token counting, and history logging.
- `comparePrompts`: Run side-by-side prompt testing against multiple configs or models and return comparison output array.
- `getExecutionHistory`: List past execution logs for audit and performance comparison.

### 6. Controller & Routes (`server/src/controllers/prompt.controller.ts` & `server/src/routes/prompt.routes.ts`)
REST Endpoints:
- `POST /api/v1/workspaces/:workspaceId/prompts/templates` -> Create prompt template
- `GET /api/v1/workspaces/:workspaceId/prompts/templates` -> List prompt templates
- `GET /api/v1/workspaces/:workspaceId/prompts/templates/:id` -> Get template details
- `PATCH /api/v1/workspaces/:workspaceId/prompts/templates/:id` -> Update template
- `DELETE /api/v1/workspaces/:workspaceId/prompts/templates/:id` -> Delete template
- `POST /api/v1/workspaces/:workspaceId/prompts/execute` -> Run prompt test in playground
- `POST /api/v1/workspaces/:workspaceId/prompts/compare` -> Run side-by-side output comparison
- `GET /api/v1/workspaces/:workspaceId/prompts/executions` -> Get prompt test history

### 7. Tests (`server/tests/prompt.test.ts`)
Unit & integration tests covering template CRUD, variable extraction, prompt execution simulation, and output comparison.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/prompts` template CRUD, variable parsing, execution history, and comparison engine endpoints.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test creating a prompt template with `{{user_name}}` variables, running execution tests, comparing two model outputs side-by-side, and reviewing history logs.
