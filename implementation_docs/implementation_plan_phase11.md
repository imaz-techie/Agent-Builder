# Implementation Plan - Phase 11: Analytics System, Telemetry & Cost Calculator

This plan details the implementation of **Phase 11 (Workspace Analytics Overview, Token & Latency Metrics, Model Cost Calculator, Audit Trail Viewing, System Telemetry, and CSV/JSON Data Export)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Cost Calculator Engine**: Computes estimated USD usage cost based on LLM model pricing rates (e.g. GPT-4o: $5.00/1M input tokens, $15.00/1M output tokens).
> - **Latency & Usage Telemetry**: Aggregates token usage, chat request volume, average latency MS, and active agent distribution per workspace.
> - **Audit Trail & System Telemetry**: Endpoint for viewing audit log actions (`AUDIT_LOG`) with filtering by action, user, and date range.
> - **Export Analytics**: Allows exporting workspace usage and cost metrics in CSV and JSON formats.
> - **Frontend Integration**: Aligns with [AnalyticsPage.tsx](file:///d:/Imaz/Imaz%20Projects/Agent%20Builder/src/pages/AnalyticsPage.tsx) so charts, cost cards, latency graphs, and audit log tables function seamlessly when `VITE_USE_API=true`.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Existing models `AuditLog` and `SystemLog` already exist. We will add any necessary indexing or helper queries in repository layer.

### 2. DTOs & Interfaces (`server/src/interfaces/analytics.interface.ts`)
- `AnalyticsOverviewResponse`, `UsageMetricsResponse`, `CostCalculationResult`, `AuditLogQueryParams`, `ExportAnalyticsQueryParams`.

### 3. Validation Schemas (`server/src/validators/analytics.validator.ts`)
Zod validation schemas for:
- `analyticsQuerySchema`, `auditLogQuerySchema`.

### 4. Cost Calculator Module (`server/src/utils/costCalculator.ts`)
- Model pricing rate table (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3.1 70B, etc.).
- Function `calculateModelCost(model, tokensUsed)` returning estimated USD cost.

### 5. Repository Layer (`server/src/repositories/analytics.repository.ts`)
Database access methods:
- `getWorkspaceUsageSummary`: Aggregates total chat messages, tokens, and latency across workspace agents.
- `getDailyUsageTimeSeries`: Group chat activity by date for chart rendering.
- `findAuditLogs`: Paginated audit log queries with filtering.

### 6. Service Layer (`server/src/services/analytics.service.ts`)
Business logic:
- `getAnalyticsOverview`: High-level cards (Total Messages, Total Tokens, Total Cost USD, Average Latency MS).
- `getUsageTimeSeries`: Daily breakdown for Recharts line/bar visualization.
- `getAgentPerformanceMetrics`: Agent breakdown by chat volume and latency.
- `getAuditLogs`: Workspace audit trail.
- `exportAnalyticsData`: Formats workspace analytics into CSV string or JSON object.

### 7. Controller & Routes (`server/src/controllers/analytics.controller.ts` & `server/src/routes/analytics.routes.ts`)
REST Endpoints:
- `GET /api/v1/workspaces/:workspaceId/analytics/overview` -> High-level metric cards
- `GET /api/v1/workspaces/:workspaceId/analytics/usage` -> Daily time series usage & cost data
- `GET /api/v1/workspaces/:workspaceId/analytics/agents` -> Agent performance breakdown
- `GET /api/v1/workspaces/:workspaceId/analytics/audit-logs` -> Paginated workspace audit trail
- `GET /api/v1/workspaces/:workspaceId/analytics/export` -> Export metrics in CSV or JSON format

### 8. Tests (`server/tests/analytics.test.ts`)
Unit & integration tests covering cost calculation, analytics aggregations, audit logs, and CSV/JSON export endpoints.

---

## Verification Plan

### Automated Tests
1. Execute Jest test suite: `npm test` verifying `/analytics` overview, usage metrics, cost calculator, audit logs, and CSV export.
2. Verify `npm run build` compiles clean.

### Manual Verification
- Test fetching analytics overview, verifying calculated USD costs for token counts, inspecting audit logs, and downloading CSV metric exports.
