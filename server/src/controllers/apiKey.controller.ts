import { Request, Response } from "express";
import { apiKeyService } from "../services/apiKey.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function createApiKey(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const apiKey = await apiKeyService.createApiKey(
    workspaceId,
    req.user!.id,
    req.body
  );
  return sendApiResponse({
    res,
    statusCode: 201,
    message: "API Key created successfully. Store secretKey securely, it won't be shown again.",
    data: { apiKey },
  });
}

export async function getWorkspaceApiKeys(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const apiKeys = await apiKeyService.getWorkspaceApiKeys(workspaceId);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "API Keys retrieved",
    data: { apiKeys },
  });
}

export async function revokeApiKey(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const keyId = Array.isArray(req.params.keyId) ? req.params.keyId[0] : req.params.keyId;

  await apiKeyService.revokeApiKey(keyId, workspaceId, req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "API Key revoked successfully",
    data: {},
  });
}
