import { Request, Response } from "express";
import { adminService } from "../services/admin.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function getPlatformStats(req: Request, res: Response) {
  const stats = await adminService.getStats();

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Platform statistics retrieved",
    data: { stats },
  });
}

export async function getUsers(req: Request, res: Response) {
  const result = await adminService.getUsers(req.query);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Platform users retrieved",
    data: { users: result.items },
    meta: result.meta,
  });
}

export async function updateUser(req: Request, res: Response) {
  const param = req.params.userId;
  const userId = Array.isArray(param) ? param[0] : param;

  const user = await adminService.updateUser(userId, req.body);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "User updated successfully",
    data: { user },
  });
}

export async function deleteUser(req: Request, res: Response) {
  const param = req.params.userId;
  const userId = Array.isArray(param) ? param[0] : param;

  const result = await adminService.deleteUser(userId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "User deleted successfully",
    data: result,
  });
}

export async function getWorkspaces(req: Request, res: Response) {
  const result = await adminService.getWorkspaces(req.query);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Platform workspaces retrieved",
    data: { workspaces: result.items },
    meta: result.meta,
  });
}

export async function getSystemLogs(req: Request, res: Response) {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const level = req.query.level as string | undefined;

  const logs = await adminService.getSystemLogs(limit, level);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "System logs retrieved",
    data: { logs },
  });
}

export async function getTelemetry(req: Request, res: Response) {
  const telemetry = await adminService.getTelemetry();

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "System telemetry retrieved",
    data: { telemetry },
  });
}
