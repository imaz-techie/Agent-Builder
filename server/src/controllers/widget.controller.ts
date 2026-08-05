import { Request, Response } from "express";
import { widgetService } from "../services/widget.service";
import { sendApiResponse } from "../utils/apiResponse";

function getWorkspaceId(req: Request): string {
  const param = req.params.workspaceId || req.params.id;
  return Array.isArray(param) ? param[0] : param;
}

export async function upsertWidgetConfig(req: Request, res: Response) {
  const param = req.params.agentId || req.params.id;
  const agentId = Array.isArray(param) ? param[0] : param;

  const config = await widgetService.upsertWidgetConfig(
    getWorkspaceId(req),
    req.user!.id,
    agentId,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Widget configuration saved successfully",
    data: { config },
  });
}

export async function getWidgetConfig(req: Request, res: Response) {
  const param = req.params.agentId || req.params.id;
  const agentId = Array.isArray(param) ? param[0] : param;

  const config = await widgetService.getWidgetConfig(getWorkspaceId(req), agentId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Widget configuration retrieved",
    data: { config },
  });
}

export async function updateWidgetConfig(req: Request, res: Response) {
  const param = req.params.widgetId || req.params.id;
  const widgetId = Array.isArray(param) ? param[0] : param;

  const config = await widgetService.updateWidgetConfig(
    getWorkspaceId(req),
    widgetId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Widget configuration updated successfully",
    data: { config },
  });
}

export async function deleteWidgetConfig(req: Request, res: Response) {
  const param = req.params.widgetId || req.params.id;
  const widgetId = Array.isArray(param) ? param[0] : param;

  const result = await widgetService.deleteWidgetConfig(getWorkspaceId(req), widgetId, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Widget configuration deleted successfully",
    data: result,
  });
}

export async function publishWidget(req: Request, res: Response) {
  const param = req.params.widgetId || req.params.id;
  const widgetId = Array.isArray(param) ? param[0] : param;

  const config = await widgetService.publishWidget(getWorkspaceId(req), widgetId, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Widget published successfully",
    data: { config },
  });
}

export async function regenerateWidgetToken(req: Request, res: Response) {
  const param = req.params.widgetId || req.params.id;
  const widgetId = Array.isArray(param) ? param[0] : param;

  const config = await widgetService.regenerateWidgetToken(getWorkspaceId(req), widgetId, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Widget token regenerated successfully",
    data: { config },
  });
}

export async function getPublicWidgetConfig(req: Request, res: Response) {
  const param = req.params.token || req.params.id;
  const token = Array.isArray(param) ? param[0] : param;

  const config = await widgetService.getPublicWidgetConfig(token);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Public widget configuration retrieved",
    data: { config },
  });
}

export async function sendPublicWidgetMessage(req: Request, res: Response) {
  const param = req.params.token || req.params.id;
  const token = Array.isArray(param) ? param[0] : param;

  const result = await widgetService.sendPublicWidgetMessage(
    token,
    req.body.message,
    req.body.sessionId
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Widget message processed successfully",
    data: result,
  });
}
