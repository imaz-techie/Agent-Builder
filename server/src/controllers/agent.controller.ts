import { Request, Response } from "express";
import { agentService } from "../services/agent.service";
import { sendApiResponse } from "../utils/apiResponse";

function getWorkspaceId(req: Request): string {
  const param = req.params.workspaceId || req.params.id;
  return (Array.isArray(param) ? param[0] : param) || "ws_default";
}

export async function createAgent(req: Request, res: Response) {
  const workspaceId = getWorkspaceId(req);

  const agent = await agentService.createAgent(workspaceId, req.user!.id, req.body);
  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Agent created successfully",
    data: { agent },
  });
}

export async function getWorkspaceAgents(req: Request, res: Response) {
  const workspaceId = getWorkspaceId(req);

  const result = await agentService.getWorkspaceAgents(workspaceId, req.query);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace agents retrieved",
    data: { agents: result.items },
    meta: result.meta,
  });
}

export async function getAgentDetails(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const agentId = Array.isArray(req.params.agentId)
    ? req.params.agentId[0]
    : req.params.agentId;

  const agent = await agentService.getAgentDetails(agentId, workspaceId);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Agent details retrieved",
    data: { agent },
  });
}

export async function updateAgent(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const agentId = Array.isArray(req.params.agentId)
    ? req.params.agentId[0]
    : req.params.agentId;

  const agent = await agentService.updateAgent(
    agentId,
    workspaceId,
    req.user!.id,
    req.body
  );
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Agent updated successfully",
    data: { agent },
  });
}

export async function cloneAgent(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const agentId = Array.isArray(req.params.agentId)
    ? req.params.agentId[0]
    : req.params.agentId;

  const agent = await agentService.cloneAgent(
    agentId,
    workspaceId,
    req.user!.id,
    req.body
  );
  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Agent cloned successfully",
    data: { agent },
  });
}

export async function archiveAgent(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const agentId = Array.isArray(req.params.agentId)
    ? req.params.agentId[0]
    : req.params.agentId;

  const agent = await agentService.archiveAgent(agentId, workspaceId, req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Agent archived successfully",
    data: { agent },
  });
}

export async function deleteAgent(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const agentId = Array.isArray(req.params.agentId)
    ? req.params.agentId[0]
    : req.params.agentId;

  await agentService.deleteAgent(agentId, workspaceId, req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Agent deleted successfully",
    data: {},
  });
}

export async function getAgentVersions(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const agentId = Array.isArray(req.params.agentId)
    ? req.params.agentId[0]
    : req.params.agentId;

  const versions = await agentService.getAgentVersions(agentId, workspaceId);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Agent version history retrieved",
    data: { versions },
  });
}
