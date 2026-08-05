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
  generateEmbedding(text: string) {
    const vector = EmbeddingService.generateEmbedding(text);
    return {
      vector,
      dimensions: vector.length,
      model: "text-embedding-3-small",
    };
  }

  /**
   * Performs hybrid search (keyword similarity + vector dot product) across workspace chunks
   */
  async retrieveHybrid(
    workspaceId: string,
    queryText: string,
    topK = 5
  ): Promise<VectorChunkMatch[]> {
    const chunks = await ragRepository.fetchWorkspaceChunks(workspaceId);
    if (chunks.length === 0) return [];

    const queryVector = EmbeddingService.generateEmbedding(queryText);
    const queryLower = queryText.toLowerCase();

    const matches: VectorChunkMatch[] = chunks.map((chunk) => {
      const chunkVector = EmbeddingService.generateEmbedding(chunk.content);
      const vectorScore = EmbeddingService.cosineSimilarity(queryVector, chunkVector);

      // Keyword boost calculation
      let keywordBoost = 0;
      const terms = queryLower.split(" ").filter((t) => t.length > 2);
      terms.forEach((term) => {
        if (chunk.content.toLowerCase().includes(term)) {
          keywordBoost += 0.15;
        }
      });

      const hybridScore = Math.min(1.0, vectorScore * 0.7 + keywordBoost);

      return {
        chunkId: chunk.id,
        fileId: chunk.knowledgeFileId,
        fileName: chunk.knowledgeFile.name,
        fileType: chunk.knowledgeFile.type,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        score: parseFloat(hybridScore.toFixed(4)),
      };
    });

    // Sort descending by similarity score
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, topK);
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
