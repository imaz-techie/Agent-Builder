# Implementation Plan - Phase 14: Billing & Subscriptions

This plan details the implementation of **Phase 14 (Subscription plans, billing accounts, invoice generation, usage metering, and Stripe webhook simulation)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Plan Catalog**: `FREE`, `PRO` ($20/mo), `BUSINESS` ($79/mo), `ENTERPRISE` ($499/mo) with monthly token quotas and seat limits defined in `server/src/utils/planCatalog.ts`.
> - **Usage Metering**: Per-model token usage recorded against the billing account with estimated USD cost via `calculateTokenCost`.
> - **Billing Periods**: 30-day rolling period; expired periods auto-advance and reset metering.
> - **Invoices**: Auto-generated `INV-YYYY-NNNN` invoices on paid plan changes.
> - **Stripe Simulation**: Simulated checkout sessions and webhook handler (`checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`) structured so a real Stripe SDK can be swapped in.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
- `BillingPlan` / `BillingStatus` / `InvoiceStatus` enums.
- `BillingAccount`: workspaceId (unique), plan, status, trial window, period start/end, Stripe IDs, seats, token quota, total spend.
- `Invoice`: invoiceNumber (unique), amount, currency, status, period window.
- `UsageRecord`: model, tokensUsed, costUsd, recordedAt.

### 2. DTOs & Interfaces (`server/src/interfaces/billing.interface.ts`)
- `UpdatePlanDTO`, `RecordUsageDTO`, `BillingQueryParams`, `BillingUsageSummary`.

### 3. Validation Schemas (`server/src/validators/billing.validator.ts`)
- Zod schemas for plan update, usage record, and paginated queries.

### 4. Utility (`server/src/utils/planCatalog.ts`)
- Plan metadata table + `getPlanMeta(plan)` helper.

### 5. Repository Layer (`server/src/repositories/billing.repository.ts`)
- Get-or-create account, account updates, Stripe lookups, invoice creation/count/list, usage records, period sums.

### 6. Service Layer (`server/src/services/billing.service.ts`)
- Account retrieval with period advancement, plan updates with invoice generation, usage summaries, usage recording (BigInt/Decimal sanitization for JSON responses), checkout session simulation, and webhook event handling with real-time `billing:updated` events.

### 7. Controller & Routes (`server/src/controllers/billing.controller.ts` & `server/src/routes/billing.routes.ts`)
REST Endpoints:
- `GET /workspaces/:id/billing/account`, `PATCH /workspaces/:id/billing/plan`, `POST /workspaces/:id/billing/checkout`
- `GET /workspaces/:id/billing/invoices`, `GET /workspaces/:id/billing/usage`, `POST /workspaces/:id/billing/usage/record`
- Public webhook: `POST /webhooks/stripe` (mounted in `app.ts`).

### 8. Tests (`server/tests/billing.test.ts`)
- Account retrieval, plan upgrade with invoice, invoice pagination, usage summary math, usage recording, and webhook processing.

---

## Verification Plan

### Automated Tests
1. Execute Jest test suite: `npm test` verifying billing endpoints and webhook.
2. Verify `npm run build` compiles clean.

### Manual Verification
- Upgrade a workspace to `PRO`, confirm invoice `INV-YYYY-NNNN` generated, record usage, and confirm usage summary math (quota, percent used, cost).
- Post a simulated `checkout.session.completed` webhook and confirm the Stripe customer is stored.
