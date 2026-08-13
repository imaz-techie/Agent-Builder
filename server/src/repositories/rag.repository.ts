import { prisma } from "../database";

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

  /**
   * pgvector cosine similarity search using the HNSW index on document_chunks.embedding
   */
  async vectorSearchChunks(workspaceId: string, vectorStr: string, topK = 5) {
    return prisma.$queryRawUnsafe<Array<{
      id: string;
      knowledge_file_id: string;
      chunk_index: number;
      content: string;
      token_count: number;
      file_name: string;
      file_type: string;
      score: number;
    }>>(
      `SELECT dc.id, dc.knowledge_file_id, dc.chunk_index, dc.content, dc.token_count,
              kf.name as file_name, kf.type as file_type,
              1 - (dc.embedding <=> $1::vector) as score
       FROM document_chunks dc
       JOIN knowledge_files kf ON dc.knowledge_file_id = kf.id
       WHERE kf.workspace_id = $2
         AND dc.embedding IS NOT NULL
       ORDER BY dc.embedding <=> $1::vector
       LIMIT $3`,
      vectorStr,
      workspaceId,
      topK
    );
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
