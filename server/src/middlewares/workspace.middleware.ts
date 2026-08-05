import { Request, Response, NextFunction } from "express";
import { workspaceRepository } from "../repositories/workspace.repository";
import { ApiError } from "../utils/apiError";
import { WorkspaceRole } from "@prisma/client";

const roleHierarchy: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export function requireWorkspaceMember(minRole: WorkspaceRole = WorkspaceRole.VIEWER) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const workspaceIdParam = req.params.workspaceId || req.params.id || req.headers["x-workspace-id"];
    const workspaceId = Array.isArray(workspaceIdParam) ? workspaceIdParam[0] : workspaceIdParam;

    if (!workspaceId) {
      return next(ApiError.badRequest("Workspace identifier is required"));
    }

    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    const member = await workspaceRepository.findMember(workspaceId, req.user.id);
    if (!member) {
      return next(ApiError.forbidden("You are not a member of this workspace"));
    }

    if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
      return next(
        ApiError.forbidden(
          `Workspace role [${member.role}] does not meet required minimum role [${minRole}]`
        )
      );
    }

    req.workspaceMember = member;
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      workspaceMember?: {
        id: string;
        workspaceId: string;
        userId: string;
        role: WorkspaceRole;
      };
    }
  }
}
