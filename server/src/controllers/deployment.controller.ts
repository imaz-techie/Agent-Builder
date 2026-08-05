import { Request, Response } from "express";
import { deploymentService } from "../services/deployment.service";
import { sendApiResponse } from "../utils/apiResponse";

function getWorkspaceId(req: Request): string {
  const param = req.params.workspaceId || req.params.id;
  return Array.isArray(param) ? param[0] : param;
}

export async function createDeployment(req: Request, res: Response) {
  const deployment = await deploymentService.createDeployment(
    getWorkspaceId(req),
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Deployment created successfully",
    data: { deployment },
  });
}

export async function getWorkspaceDeployments(req: Request, res: Response) {
  const result = await deploymentService.getWorkspaceDeployments(getWorkspaceId(req), req.query);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace deployments retrieved",
    data: { deployments: result.items },
    meta: result.meta,
  });
}

export async function getDeploymentDetails(req: Request, res: Response) {
  const param = req.params.deploymentId || req.params.id;
  const deploymentId = Array.isArray(param) ? param[0] : param;

  const deployment = await deploymentService.getDeploymentDetails(deploymentId, getWorkspaceId(req));

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Deployment details retrieved",
    data: { deployment },
  });
}

export async function updateDeployment(req: Request, res: Response) {
  const param = req.params.deploymentId || req.params.id;
  const deploymentId = Array.isArray(param) ? param[0] : param;

  const deployment = await deploymentService.updateDeployment(
    deploymentId,
    getWorkspaceId(req),
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Deployment updated successfully",
    data: { deployment },
  });
}

export async function rollbackDeployment(req: Request, res: Response) {
  const param = req.params.deploymentId || req.params.id;
  const deploymentId = Array.isArray(param) ? param[0] : param;

  const deployment = await deploymentService.rollbackDeployment(
    deploymentId,
    getWorkspaceId(req),
    req.user!.id
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Deployment rolled back successfully",
    data: { deployment },
  });
}

export async function deleteDeployment(req: Request, res: Response) {
  const param = req.params.deploymentId || req.params.id;
  const deploymentId = Array.isArray(param) ? param[0] : param;

  const result = await deploymentService.deleteDeployment(
    deploymentId,
    getWorkspaceId(req),
    req.user!.id
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Deployment deleted successfully",
    data: result,
  });
}
