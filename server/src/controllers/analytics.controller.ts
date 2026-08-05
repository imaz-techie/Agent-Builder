import { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";
import { sendApiResponse } from "../utils/apiResponse";

function getWorkspaceId(req: Request): string {
  const param = req.params.workspaceId || req.params.id;
  return (Array.isArray(param) ? param[0] : param) || "ws_default";
}

export async function getOverview(req: Request, res: Response) {
  const workspaceId = getWorkspaceId(req);

  const overview = await analyticsService.getOverview(workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Analytics overview metrics retrieved",
    data: { overview },
  });
}

export async function getUsageTimeSeries(req: Request, res: Response) {
  const workspaceId = getWorkspaceId(req);

  const usage = await analyticsService.getUsageTimeSeries(workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Usage time series metrics retrieved",
    data: { usage },
  });
}

export async function getAgentPerformance(req: Request, res: Response) {
  const workspaceId = getWorkspaceId(req);

  const agents = await analyticsService.getAgentPerformance(workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Agent performance metrics retrieved",
    data: { agents },
  });
}

export async function getAuditLogs(req: Request, res: Response) {
  const workspaceId = getWorkspaceId(req);

  const result = await analyticsService.getAuditLogs(workspaceId, req.query);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace audit logs retrieved",
    data: { auditLogs: result.items },
    meta: result.meta,
  });
}

export async function exportAnalyticsData(req: Request, res: Response) {
  const workspaceId = getWorkspaceId(req);
  const format = (req.query.format as string) || "csv";

  const data = await analyticsService.exportAnalyticsData(workspaceId, format);

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=workspace-analytics-${workspaceId}.csv`);
    return res.status(200).send(data);
  }

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Analytics export data generated",
    data: JSON.parse(data),
  });
}
