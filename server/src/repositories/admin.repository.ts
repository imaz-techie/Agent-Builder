import { prisma } from "../database";
import { AgentStatus, Role } from "@prisma/client";

export interface AdminUserFilters {
  search?: string;
  role?: Role;
  skip: number;
  take: number;
}

export interface AdminWorkspaceFilters {
  search?: string;
  skip: number;
  take: number;
}

export class AdminRepository {
  async getPlatformStats() {
    const [
      totalUsers,
      totalWorkspaces,
      totalAgents,
      activeAgents,
      totalChatMessages,
      tokenAggregation,
      totalKnowledgeFiles,
      totalTrainingJobs,
      totalApiKeys,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.agent.count(),
      prisma.agent.count({ where: { status: AgentStatus.ACTIVE } }),
      prisma.chatMessage.count(),
      prisma.chatMessage.aggregate({ _sum: { tokensCount: true } }),
      prisma.knowledgeFile.count(),
      prisma.trainingJob.count(),
      prisma.apiKey.count(),
    ]);

    return {
      totalUsers,
      totalWorkspaces,
      totalAgents,
      activeAgents,
      totalChatMessages,
      totalTokensUsed: Number(tokenAggregation._sum.tokensCount || 0),
      totalKnowledgeFiles,
      totalTrainingJobs,
      totalApiKeys,
    };
  }

  async findUsers(filters: AdminUserFilters) {
    const where: Record<string, unknown> = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.role) where.role = filters.role;

    const [items, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, totalItems };
  }

  async updateUser(userId: string, data: { role?: Role; isVerified?: boolean }) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async deleteUser(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }

  async findWorkspaces(filters: AdminWorkspaceFilters) {
    const where: Record<string, unknown> = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      prisma.workspace.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
        include: {
          _count: { select: { members: true, agents: true } },
        },
      }),
      prisma.workspace.count({ where }),
    ]);

    return { items, totalItems };
  }

  async getTotalSpendUsd() {
    const aggregation = await prisma.billingAccount.aggregate({
      _sum: { totalSpendUsd: true },
    });
    return Number(aggregation._sum.totalSpendUsd || 0);
  }

  async findSystemLogs(limit: number, level?: string) {
    const where = level ? { level } : {};
    return prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async createSystemLog(level: string, message: string, metadata?: Record<string, unknown>) {
    return prisma.systemLog.create({
      data: {
        level,
        message,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  }
}

export const adminRepository = new AdminRepository();
