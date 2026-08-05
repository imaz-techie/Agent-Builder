import { prisma } from "../database";
import { VectorChunkMatch } from "../interfaces/rag.interface";

export class RagRepository {
  async fetchWorkspaceChunks(workspaceId: string) {
    return prisma.documentChunk.findMany({
      where: {
        knowledgeFile: {
          workspaceId,
        },
      },
      include: {
        knowledgeFile: true,
      },
    });
  }

  async saveRagQueryLog(data: {
    agentId?: string;
    queryText: string;
    retrievedChunksCount: number;
    topScore: number;
    contextTokens: number;
    citations: any;
    latencyMs: number;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.ragQueryLog.create({
      data: {
        agentId: data.agentId || null,
        queryText: data.queryText,
        retrievedChunksCount: data.retrievedChunksCount,
        topScore: data.topScore,
        contextTokens: data.contextTokens,
        citations: data.citations ? JSON.parse(JSON.stringify(data.citations)) : undefined,
        latencyMs: data.latencyMs,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findLogsByWorkspace(workspaceId: string, limit = 20) {
    return prisma.ragQueryLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const ragRepository = new RagRepository();
