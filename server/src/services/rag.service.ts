import { ragRepository } from "../repositories/rag.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { EmbeddingService } from "./embedding.service";
import {
  RagQueryDTO,
  VectorChunkMatch,
  CitationItem,
  ContextBuildResult,
} from "../interfaces/rag.interface";
import { RagQueryLog } from "@prisma/client";

function sanitizeRagLog(log: RagQueryLog) {
  return {
    id: log.id,
    agentId: log.agentId,
    queryText: log.queryText,
    retrievedChunksCount: log.retrievedChunksCount,
    topScore: log.topScore,
    contextTokens: log.contextTokens,
    citations: log.citations as unknown as CitationItem[],
    latencyMs: log.latencyMs,
    workspaceId: log.workspaceId,
    createdAt: log.createdAt,
  };
}

export class RagService {
  /**
   * Generates embedding vector for raw text
   */
  async generateEmbedding(text: string) {
    const vector = await EmbeddingService.generateEmbedding(text);
    return {
      vector,
      dimensions: vector.length,
      model: "text-embedding-004",
    };
  }

  /**
   * Performs pgvector cosine similarity search across workspace chunks
   */
  async retrieveHybrid(
    workspaceId: string,
    queryText: string,
    topK = 5
  ): Promise<VectorChunkMatch[]> {
    // 1. Generate query embedding via Gemini
    const queryVector = await EmbeddingService.generateEmbedding(queryText);
    if (queryVector.length === 0) return [];
    const vectorStr = `[${queryVector.join(",")}]`;

    // 2. pgvector cosine similarity search (HNSW index accelerated)
    const results = await ragRepository.vectorSearchChunks(workspaceId, vectorStr, topK);

    return results.map((r) => ({
      chunkId: r.id,
      fileId: r.knowledge_file_id,
      fileName: r.file_name,
      fileType: r.file_type,
      chunkIndex: r.chunk_index,
      content: r.content,
      tokenCount: r.token_count,
      score: parseFloat(Number(r.score).toFixed(4)),
    }));
  }

  /**
   * Context Builder & Token Windowing Engine
   */
  buildContextWindow(matches: VectorChunkMatch[], maxTokens = 2048): ContextBuildResult {
    let contextPrompt = "";
    let contextTokens = 0;
    const citations: CitationItem[] = [];

    for (const match of matches) {
      if (contextTokens + match.tokenCount > maxTokens) break;

      contextPrompt += `[Source: ${match.fileName} (Chunk ${match.chunkIndex})]\n${match.content}\n\n`;
      contextTokens += match.tokenCount;

      citations.push({
        fileId: match.fileId,
        fileName: match.fileName,
        fileType: match.fileType,
        chunkIndex: match.chunkIndex,
        snippet: match.content.substring(0, 150) + "...",
        score: match.score,
      });
    }

    const topScore = matches.length > 0 ? matches[0].score : 0;

    return {
      contextPrompt: contextPrompt.trim(),
      contextTokens,
      citations,
      retrievedCount: matches.length,
      topScore,
    };
  }

  /**
   * Complete RAG Query Pipeline
   */
  async queryRag(workspaceId: string, userId: string, dto: RagQueryDTO) {
    const startTime = Date.now();

    const matches = await this.retrieveHybrid(workspaceId, dto.query, dto.topK || 5);
    const contextResult = this.buildContextWindow(matches, dto.maxTokensContext || 2048);

    const latencyMs = Date.now() - startTime;

    const log = await ragRepository.saveRagQueryLog({
      agentId: dto.agentId,
      queryText: dto.query,
      retrievedChunksCount: contextResult.retrievedCount,
      topScore: contextResult.topScore,
      contextTokens: contextResult.contextTokens,
      citations: contextResult.citations,
      latencyMs,
      workspaceId,
      createdById: userId,
    });

    return {
      query: dto.query,
      context: contextResult.contextPrompt,
      citations: contextResult.citations,
      metrics: {
        retrievedCount: contextResult.retrievedCount,
        topScore: contextResult.topScore,
        contextTokens: contextResult.contextTokens,
        latencyMs,
      },
      logId: log.id,
    };
  }

  async getRagLogs(workspaceId: string) {
    const logs = await ragRepository.findLogsByWorkspace(workspaceId);
    return logs.map(sanitizeRagLog);
  }
}

export const ragService = new RagService();
