import { Request, Response } from "express";
import { workspaceService } from "../services/workspace.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function createWorkspace(req: Request, res: Response) {
  const workspace = await workspaceService.createWorkspace(req.user!.id, req.body);
  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Workspace created successfully",
    data: { workspace },
  });
}

export async function getUserWorkspaces(req: Request, res: Response) {
  const workspaces = await workspaceService.getUserWorkspaces(req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "User workspaces retrieved",
    data: { workspaces },
  });
}

export async function getWorkspaceDetails(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const workspace = await workspaceService.getWorkspaceDetails(id, req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace details retrieved",
    data: { workspace },
  });
}

export async function updateWorkspace(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const workspace = await workspaceService.updateWorkspace(
    id,
    req.user!.id,
    req.body
  );
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace updated successfully",
    data: { workspace },
  });
}

export async function updateBranding(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const workspace = await workspaceService.updateBranding(id, req.user!.id, req.body);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace branding updated successfully",
    data: { workspace },
  });
}

export async function updateSecurity(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const workspace = await workspaceService.updateSecurity(id, req.user!.id, req.body);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace security settings updated successfully",
    data: { workspace },
  });
}

export async function deleteWorkspace(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await workspaceService.deleteWorkspace(id, req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace deleted successfully",
    data: {},
  });
}

export async function inviteMember(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const invite = await workspaceService.inviteMember(
    id,
    req.user!.id,
    req.body
  );
  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Invitation sent successfully",
    data: { invite },
  });
}

export async function acceptInvite(req: Request, res: Response) {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const member = await workspaceService.acceptInvite(token, req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Successfully joined workspace",
    data: { member },
  });
}

export async function updateMemberRole(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const member = await workspaceService.updateMemberRole(
    id,
    req.user!.id,
    userId,
    req.body
  );
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Member role updated successfully",
    data: { member },
  });
}

export async function removeMember(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  await workspaceService.removeMember(id, req.user!.id, userId);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Member removed from workspace",
    data: {},
  });
}

export async function getAuditLogs(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const logs = await workspaceService.getAuditLogs(id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace audit logs retrieved",
    data: { logs },
  });
}
