import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  auditLogQuerySchema,
  exportAnalyticsQuerySchema,
} from "../validators/analytics.validator";
import {
  getOverview,
  getUsageTimeSeries,
  getAgentPerformance,
  getAuditLogs,
  exportAnalyticsData,
} from "../controllers/analytics.controller";

const router = Router();

// Top-level direct analytics endpoints (unscoped by workspace ID in URL)
router.get("/analytics/overview", authenticate, asyncHandler(getOverview));
router.get("/analytics/usage", authenticate, asyncHandler(getUsageTimeSeries));
router.get("/analytics/distribution", authenticate, asyncHandler(getAgentPerformance));
router.get("/analytics/agents", authenticate, asyncHandler(getAgentPerformance));
router.get("/analytics/timeline", authenticate, asyncHandler(getAuditLogs));
router.get("/analytics/audit-logs", authenticate, asyncHandler(getAuditLogs));

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/analytics/overview:
 *   get:
 *     summary: Get Workspace Analytics Overview Cards
 *     description: Returns aggregated metrics for total messages, tokens used, estimated USD cost, and average latency MS.
 *     tags:
 *       - Analytics System
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Overview metrics retrieved
 */
router.get(
  "/workspaces/:id/analytics/overview",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getOverview)
);

/**
 * @openapi
 * /workspaces/{id}/analytics/usage:
 *   get:
 *     summary: Get Daily Usage & Cost Time Series
 *     tags:
 *       - Analytics System
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Usage time series data retrieved
 */
router.get(
  "/workspaces/:id/analytics/usage",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getUsageTimeSeries)
);

/**
 * @openapi
 * /workspaces/{id}/analytics/agents:
 *   get:
 *     summary: Get Agent Performance Metrics Breakdown
 *     tags:
 *       - Analytics System
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Agent metrics retrieved
 */
router.get(
  "/workspaces/:id/analytics/agents",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getAgentPerformance)
);

/**
 * @openapi
 * /workspaces/{id}/analytics/audit-logs:
 *   get:
 *     summary: List Workspace Audit Logs
 *     tags:
 *       - Analytics System
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Audit logs retrieved
 */
router.get(
  "/workspaces/:id/analytics/audit-logs",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(auditLogQuerySchema),
  asyncHandler(getAuditLogs)
);

/**
 * @openapi
 * /workspaces/{id}/analytics/export:
 *   get:
 *     summary: Export Analytics Data (CSV / JSON)
 *     tags:
 *       - Analytics System
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: format
 *         in: query
 *         schema: { type: "string", enum: ["csv", "json"], example: "csv" }
 *     responses:
 *       200:
 *         description: Export file generated
 */
router.get(
  "/workspaces/:id/analytics/export",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(exportAnalyticsQuerySchema),
  asyncHandler(exportAnalyticsData)
);

export default router;
