import { prisma } from "../database";
import { Prisma } from "@prisma/client";

export class AnalyticsRepository {
  async getWorkspaceMessageStats(workspaceId: string) {
    const [totalMessages, tokenAggregate, latencyAggregate] = await Promise.all([
      prisma.chatMessage.count({ where: { workspaceId } }),
      prisma.chatMessage.aggregate({
        where: { workspaceId },
        _sum: { tokensCount: true },
      }),
      prisma.chatMessage.aggregate({
        where: { workspaceId, role: "ASSISTANT" },
        _avg: { latencyMs: true },
      }),
    ]);

    return {
      totalMessages,
      totalTokens: tokenAggregate._sum.tokensCount || 0,
      avgLatencyMs: Math.round(latencyAggregate._avg.latencyMs || 0),
    };
  }

  async getWorkspaceAgents(workspaceId: string) {
    return prisma.agent.findMany({
      where: { workspaceId },
      include: {
        chatSessions: {
          include: {
            messages: true,
          },
        },
      },
    });
  }

  async getKnowledgeFilesCount(workspaceId: string) {
    return prisma.knowledgeFile.count({ where: { workspaceId } });
  }

  async findAuditLogs(
    workspaceId: string,
    params: {
      action?: string;
      userId?: string;
      skip?: number;
      take?: number;
    }
  ) {
    const where: Prisma.AuditLogWhereInput = {
      workspaceId,
      ...(params.action ? { action: params.action } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip || 0,
        take: params.take || 20,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, totalItems };
  }
}

export const analyticsRepository = new AnalyticsRepository();
