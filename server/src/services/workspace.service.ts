import crypto from "crypto";
import { workspaceRepository } from "../repositories/workspace.repository";
import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/apiError";
import {
  CreateWorkspaceDTO,
  UpdateWorkspaceDTO,
  UpdateBrandingDTO,
  UpdateSecurityDTO,
  InviteMemberDTO,
  UpdateMemberRoleDTO,
} from "../interfaces/workspace.interface";
import { WorkspaceRole, InviteStatus } from "@prisma/client";

export class WorkspaceService {
  async createWorkspace(userId: string, dto: CreateWorkspaceDTO) {
    const workspace = await workspaceRepository.createWorkspace(userId, dto.name, dto.logoUrl);
    await workspaceRepository.logAuditAction(userId, workspace.id, "WORKSPACE_CREATED", {
      name: workspace.name,
    });
    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    const workspaces = await workspaceRepository.findWorkspacesByUserId(userId);
    return workspaces.map((w) => {
      const userMember = w.members.find((m) => m.userId === userId);
      return {
        id: w.id,
        name: w.name,
        slug: w.slug,
        logoUrl: w.logoUrl,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        memberRole: userMember ? userMember.role : undefined,
        memberCount: w._count.members,
      };
    });
  }

  async getWorkspaceDetails(workspaceId: string, userId: string) {
    const workspace = await workspaceRepository.findWorkspaceById(workspaceId);
    if (!workspace) {
      throw ApiError.notFound("Workspace not found");
    }

    const member = workspace.members.find((m) => m.userId === userId);
    if (!member) {
      throw ApiError.forbidden("You are not a member of this workspace");
    }

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logoUrl: workspace.logoUrl,
      branding: workspace.branding,
      ipWhitelist: workspace.ipWhitelist,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      memberRole: member.role,
      memberCount: workspace._count.members,
      members: workspace.members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        joinedAt: m.createdAt,
      })),
    };
  }

  async updateWorkspace(workspaceId: string, userId: string, dto: UpdateWorkspaceDTO) {
    const updated = await workspaceRepository.updateWorkspace(workspaceId, dto);
    await workspaceRepository.logAuditAction(userId, workspaceId, "WORKSPACE_UPDATED", dto as Record<string, unknown>);
    return updated;
  }

  async updateBranding(workspaceId: string, userId: string, dto: UpdateBrandingDTO) {
    const branding = {
      primaryColor: dto.primaryColor,
      accentColor: dto.accentColor,
      faviconUrl: dto.faviconUrl,
      bannerText: dto.bannerText,
    };
    const updated = await workspaceRepository.updateBranding(workspaceId, branding);
    await workspaceRepository.logAuditAction(userId, workspaceId, "WORKSPACE_BRANDING_UPDATED", branding);
    return updated;
  }

  async updateSecurity(workspaceId: string, userId: string, dto: UpdateSecurityDTO) {
    const updated = await workspaceRepository.updateSecurity(workspaceId, dto);
    await workspaceRepository.logAuditAction(userId, workspaceId, "WORKSPACE_SECURITY_UPDATED", {
      ipWhitelist: dto.ipWhitelist,
    });
    return updated;
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    await workspaceRepository.deleteWorkspace(workspaceId);
    await workspaceRepository.logAuditAction(userId, null, "WORKSPACE_DELETED", { workspaceId });
  }

  async inviteMember(workspaceId: string, userId: string, dto: InviteMemberDTO) {
    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) {
      const isMember = await workspaceRepository.findMember(workspaceId, existingUser.id);
      if (isMember) {
        throw ApiError.badRequest("User is already a member of this workspace");
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const role = dto.role || WorkspaceRole.MEMBER;

    const invite = await workspaceRepository.createInvite(workspaceId, dto.email, role, token, expiresAt);
    await workspaceRepository.logAuditAction(userId, workspaceId, "MEMBER_INVITED", {
      email: dto.email,
      role,
    });

    return {
      inviteId: invite.id,
      email: invite.email,
      role: invite.role,
      token: process.env.NODE_ENV === "development" ? token : undefined,
      expiresAt: invite.expiresAt,
    };
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await workspaceRepository.findInviteByToken(token);
    if (!invite || invite.status !== InviteStatus.PENDING || invite.expiresAt < new Date()) {
      throw ApiError.badRequest("Invalid or expired invitation token");
    }

    const member = await workspaceRepository.addMember(invite.workspaceId, userId, invite.role);
    await workspaceRepository.updateInviteStatus(invite.id, InviteStatus.ACCEPTED);
    await workspaceRepository.logAuditAction(userId, invite.workspaceId, "INVITE_ACCEPTED", {
      role: invite.role,
    });

    return member;
  }

  async updateMemberRole(workspaceId: string, operatorUserId: string, targetUserId: string, dto: UpdateMemberRoleDTO) {
    const updated = await workspaceRepository.updateMemberRole(workspaceId, targetUserId, dto.role);
    await workspaceRepository.logAuditAction(operatorUserId, workspaceId, "MEMBER_ROLE_UPDATED", {
      targetUserId,
      newRole: dto.role,
    });
    return updated;
  }

  async removeMember(workspaceId: string, operatorUserId: string, targetUserId: string) {
    await workspaceRepository.removeMember(workspaceId, targetUserId);
    await workspaceRepository.logAuditAction(operatorUserId, workspaceId, "MEMBER_REMOVED", {
      targetUserId,
    });
  }

  async getAuditLogs(workspaceId: string) {
    const logs = await workspaceRepository.getAuditLogs(workspaceId);
    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      userName: l.user ? l.user.name : "System",
      userEmail: l.user ? l.user.email : null,
      metadata: l.metadata,
      createdAt: l.createdAt,
    }));
  }
}

export const workspaceService = new WorkspaceService();
