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

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/analytics/overview:
 *   get:
 *     summary: Get high-level workspace analytics overview cards (messages, tokens, cost, latency)
 *     tags:
 *       - Analytics System
 */
router.get(
  "/workspaces/:id/analytics/overview",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getOverview)
);

router.get(
  "/workspaces/:id/analytics/usage",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getUsageTimeSeries)
);

router.get(
  "/workspaces/:id/analytics/agents",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getAgentPerformance)
);

router.get(
  "/workspaces/:id/analytics/audit-logs",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(auditLogQuerySchema),
  asyncHandler(getAuditLogs)
);

router.get(
  "/workspaces/:id/analytics/export",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  validate(exportAnalyticsQuerySchema),
  asyncHandler(exportAnalyticsData)
);

export default router;
