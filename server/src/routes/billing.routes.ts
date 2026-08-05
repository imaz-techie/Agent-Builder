import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import { updatePlanSchema, recordUsageSchema } from "../validators/billing.validator";
import {
  getAccount,
  updatePlan,
  getInvoices,
  getUsageSummary,
  recordUsage,
} from "../controllers/billing.controller";

const router = Router();

// Top-level direct billing endpoints
router.get("/billing/invoices", authenticate, asyncHandler(getInvoices));
router.get("/billing/subscription", authenticate, asyncHandler(getAccount));
router.patch("/billing/subscription", authenticate, validate(updatePlanSchema), asyncHandler(updatePlan));
router.get("/billing/account", authenticate, asyncHandler(getAccount));
router.get("/billing/usage", authenticate, asyncHandler(getUsageSummary));

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/billing/account:
 *   get:
 *     summary: Get Workspace Billing Account & Plan Quota
 *     description: Returns current subscription tier, monthly token limits, active seats, and current spending USD.
 *     tags:
 *       - Billing & Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Billing details retrieved
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
 *     summary: Upgrade or Update Subscription Plan
 *     tags:
 *       - Billing & Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *             properties:
 *               plan: { type: "string", enum: ["FREE", "PRO", "BUSINESS", "ENTERPRISE"], example: "PRO" }
 *     responses:
 *       200:
 *         description: Subscription updated
 */
router.patch(
  "/workspaces/:id/billing/plan",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(updatePlanSchema),
  asyncHandler(updatePlan)
);

router.patch(
  "/workspaces/:id/billing/subscription",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(updatePlanSchema),
  asyncHandler(updatePlan)
);

/**
 * @openapi
 * /workspaces/{id}/billing/invoices:
 *   get:
 *     summary: List Workspace Billing Invoices
 *     tags:
 *       - Billing & Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Invoices list retrieved
 */
router.get(
  "/workspaces/:id/billing/invoices",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getInvoices)
);

/**
 * @openapi
 * /workspaces/{id}/billing/usage:
 *   get:
 *     summary: List Detailed Token Usage Summary
 *     tags:
 *       - Billing & Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Usage records retrieved
 */
router.get(
  "/workspaces/:id/billing/usage",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getUsageSummary)
);

/**
 * @openapi
 * /workspaces/{id}/billing/usage/record:
 *   post:
 *     summary: Record Token Usage Event
 *     tags:
 *       - Billing & Subscriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - tokensUsed
 *             properties:
 *               model: { type: "string", example: "GPT_4O" }
 *               tokensUsed: { type: "integer", example: 1000 }
 *     responses:
 *       200:
 *         description: Usage recorded
 */
router.post(
  "/workspaces/:id/billing/usage/record",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(recordUsageSchema),
  asyncHandler(recordUsage)
);

export default router;
