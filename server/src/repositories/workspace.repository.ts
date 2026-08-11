import { prisma } from "../database";
import { WorkspaceRole, InviteStatus } from "@prisma/client";

export class WorkspaceRepository {
  async createWorkspace(userId: string, name: string, logoUrl?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
    return prisma.workspace.create({
      data: {
        name,
        slug,
        logoUrl: logoUrl || null,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findWorkspacesByUserId(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findWorkspaceById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async updateWorkspace(id: string, data: { name?: string; logoUrl?: string | null }) {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async updateBranding(id: string, branding: Record<string, unknown>) {
    return prisma.workspace.update({
      where: { id },
      data: { branding: JSON.parse(JSON.stringify(branding)) },
    });
  }

  async updateSecurity(id: string, data: { ipWhitelist: string[] }) {
    return prisma.workspace.update({
      where: { id },
      data: { ipWhitelist: data.ipWhitelist },
    });
  }

  async deleteWorkspace(id: string) {
    return prisma.workspace.delete({
      where: { id },
    });
  }

  async findMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      include: { user: true },
    });
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole = WorkspaceRole.MEMBER) {
    return prisma.workspaceMember.create({
      data: { workspaceId, userId, role },
      include: { user: true },
    });
  }

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole) {
    return prisma.workspaceMember.update({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      data: { role },
      include: { user: true },
    });
  }

  async removeMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
  }

  async createInvite(workspaceId: string, email: string, role: WorkspaceRole, token: string, expiresAt: Date) {
    return prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email: email.toLowerCase(),
        role,
        token,
        expiresAt,
      },
    });
  }

  async findInviteByToken(token: string) {
    return prisma.workspaceInvite.findUnique({
      where: { token },
      include: { workspace: true },
    });
  }

  async updateInviteStatus(id: string, status: InviteStatus) {
    return prisma.workspaceInvite.update({
      where: { id },
      data: { status },
    });
  }

  async logAuditAction(userId: string | null, workspaceId: string | null, action: string, metadata?: Record<string, unknown>) {
    return prisma.auditLog.create({
      data: {
        userId,
        workspaceId,
        action,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  }

  async getAuditLogs(workspaceId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
