import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  updatePlanSchema,
  billingQuerySchema,
  recordUsageSchema,
} from "../validators/billing.validator";
import {
  getAccount,
  updatePlan,
  getInvoices,
  getUsageSummary,
  recordUsage,
  createCheckoutSession,
} from "../controllers/billing.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/billing/account:
 *   get:
 *     summary: Get workspace billing account and subscription details
 *     tags:
 *       - Billing & Subscriptions
 */
router.get(
  "/workspaces/:id/billing/account",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getAccount)
);

/**
 * @openapi
 * /workspaces/{id}/billing/plan:
 *   patch:
 *     summary: Upgrade or downgrade subscription plan
 *     tags:
 *       - Billing & Subscriptions
 * /workspaces/{id}/billing/checkout:
 *   post:
 *     summary: Create a simulated Stripe checkout session for a plan
 *     tags:
 *       - Billing & Subscriptions
 */
router.patch(
  "/workspaces/:id/billing/plan",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(updatePlanSchema),
  asyncHandler(updatePlan)
);

router.post(
  "/workspaces/:id/billing/checkout",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(updatePlanSchema),
  asyncHandler(createCheckoutSession)
);

/**
 * @openapi
 * /workspaces/{id}/billing/invoices:
 *   get:
 *     summary: List paginated workspace invoices
 *     tags:
 *       - Billing & Subscriptions
 * /workspaces/{id}/billing/usage:
 *   get:
 *     summary: Get current period token usage and cost summary
 *     tags:
 *       - Billing & Subscriptions
 */
router.get(
  "/workspaces/:id/billing/invoices",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(billingQuerySchema),
  asyncHandler(getInvoices)
);

router.get(
  "/workspaces/:id/billing/usage",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getUsageSummary)
);

/**
 * @openapi
 * /workspaces/{id}/billing/usage/record:
 *   post:
 *     summary: Record LLM token usage against the billing account
 *     tags:
 *       - Billing & Subscriptions
 */
router.post(
  "/workspaces/:id/billing/usage/record",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(recordUsageSchema),
  asyncHandler(recordUsage)
);

export default router;
