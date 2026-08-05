import { prisma } from "../database";
import { ChatRole, Prisma } from "@prisma/client";

export class ChatRepository {
  async createSession(data: {
    agentId: string;
    title?: string;
    metadata?: Record<string, unknown>;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.conversationSession.create({
      data: {
        agentId: data.agentId,
        title: data.title || "New Conversation",
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findSessionById(id: string, workspaceId: string) {
    return prisma.conversationSession.findFirst({
      where: { id, workspaceId },
      include: {
        agent: true,
      },
    });
  }

  async findSessionsByAgent(agentId: string, workspaceId: string) {
    return prisma.conversationSession.findMany({
      where: { agentId, workspaceId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async createMessage(data: {
    sessionId: string;
    role: ChatRole;
    content: string;
    tokensCount?: number;
    latencyMs?: number;
    citations?: any;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.chatMessage.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        tokensCount: data.tokensCount || 0,
        latencyMs: data.latencyMs || 0,
        citations: data.citations ? JSON.parse(JSON.stringify(data.citations)) : undefined,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findMessagesBySession(sessionId: string, workspaceId: string, limit = 50) {
    return prisma.chatMessage.findMany({
      where: { sessionId, workspaceId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async touchSession(id: string) {
    return prisma.conversationSession.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }
}

export const chatRepository = new ChatRepository();
