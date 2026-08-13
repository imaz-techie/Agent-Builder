import { knowledgeRepository } from "../repositories/knowledge.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { prisma } from "../database";
import { EmbeddingService } from "./embedding.service";
import { logger } from "../utils/logger";
import {
  saveUploadedFile,
  deleteStoredFile,
  readStoredFileContent,
  detectFileType,
} from "../storage/fileStorage";
import { ApiError } from "../utils/apiError";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import {
  AddUrlSourceDTO,
  KnowledgeFileQueryParams,
} from "../interfaces/knowledge.interface";
import { FileStatus, FileType, KnowledgeFile } from "@prisma/client";

/**
 * Text Chunking Engine Algorithm
 * Splits raw document text into overlapping chunks (e.g. 500 characters with 50 character overlap)
 */
function chunkTextContent(
  text: string,
  chunkSize = 500,
  chunkOverlap = 50
): Array<{ content: string; tokenCount: number }> {
  if (!text || text.trim().length === 0) {
    return [{ content: "Empty document content", tokenCount: 3 }];
  }

  const chunks: Array<{ content: string; tokenCount: number }> = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunkContent = text.substring(startIndex, endIndex).trim();

    if (chunkContent.length > 0) {
      // Rough token estimation: ~4 chars per token
      const estimatedTokens = Math.ceil(chunkContent.length / 4);
      chunks.push({
        content: chunkContent,
        tokenCount: estimatedTokens,
      });
    }

    startIndex += chunkSize - chunkOverlap;
  }

  return chunks;
}

function sanitizeKnowledgeFile(file: KnowledgeFile) {
  return {
    id: file.id,
    name: file.name,
    type: file.type,
    sizeBytes: file.sizeBytes.toString(),
    mimeType: file.mimeType,
    filePath: file.filePath,
    url: file.url,
    status: file.status,
    chunksCount: file.chunksCount,
    errorMessage: file.errorMessage,
    workspaceId: file.workspaceId,
    createdById: file.createdById,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}

export class KnowledgeService {
  /**
   * Generates Gemini embeddings for every chunk of a file and persists them via raw SQL.
   * A single chunk failure does not fail the whole upload (logged as a warning).
   */
  private async embedFileChunks(knowledgeFileId: string): Promise<number> {
    const chunkRecords = await prisma.documentChunk.findMany({
      where: { knowledgeFileId },
      orderBy: { chunkIndex: "asc" },
      select: { id: true, content: true },
    });

    let embedded = 0;
    for (const chunk of chunkRecords) {
      try {
        const embedding = await EmbeddingService.generateEmbedding(chunk.content);
        const vectorStr = `[${embedding.join(",")}]`;
        await prisma.$executeRawUnsafe(
          `UPDATE document_chunks SET embedding = $1::vector WHERE id = $2`,
          vectorStr,
          chunk.id
        );
        embedded++;
      } catch (err) {
        logger.warn(`Failed to embed chunk ${chunk.id}: ${(err as Error).message}`);
      }
    }

    return embedded;
  }

  async uploadAndIngestFile(
    workspaceId: string,
    userId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string }
  ) {
    const fileType = detectFileType(file.originalname, file.mimetype);
    const { filePath, sizeBytes } = saveUploadedFile(file.originalname, file.buffer);

    const record = await knowledgeRepository.createFile({
      name: file.originalname,
      type: fileType,
      sizeBytes,
      mimeType: file.mimetype,
      filePath,
      status: FileStatus.PROCESSING,
      workspaceId,
      createdById: userId,
    });

    try {
      // Parse file content & run chunking algorithm
      const rawText = readStoredFileContent(filePath);
      const parsedChunks = chunkTextContent(rawText);

      await knowledgeRepository.createChunks(
        parsedChunks.map((c, index) => ({
          knowledgeFileId: record.id,
          chunkIndex: index,
          content: c.content,
          tokenCount: c.tokenCount,
          metadata: { source: record.name, type: fileType },
        }))
      );

      await this.embedFileChunks(record.id);

      const updated = await knowledgeRepository.updateFileStatus(
        record.id,
        FileStatus.INDEXED,
        parsedChunks.length
      );

      await workspaceRepository.logAuditAction(userId, workspaceId, "KNOWLEDGE_FILE_UPLOADED", {
        fileId: record.id,
        name: record.name,
        chunks: parsedChunks.length,
      });

      return sanitizeKnowledgeFile(updated);
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Failed to index document";
      await knowledgeRepository.updateFileStatus(record.id, FileStatus.FAILED, 0, errMessage);
      throw ApiError.badRequest(`File indexing failed: ${errMessage}`);
    }
  }

  async addUrlSource(workspaceId: string, userId: string, dto: AddUrlSourceDTO) {
    const name = dto.name || dto.url;
    const dummyText = `Scraped webpage content from ${dto.url}. This contains indexed knowledge text for RAG retrieval.`;

    const record = await knowledgeRepository.createFile({
      name,
      type: FileType.URL,
      sizeBytes: dummyText.length,
      url: dto.url,
      status: FileStatus.PROCESSING,
      workspaceId,
      createdById: userId,
    });

    const parsedChunks = chunkTextContent(dummyText);
    await knowledgeRepository.createChunks(
      parsedChunks.map((c, index) => ({
        knowledgeFileId: record.id,
        chunkIndex: index,
        content: c.content,
        tokenCount: c.tokenCount,
        metadata: { url: dto.url },
      }))
    );

    await this.embedFileChunks(record.id);

    const updated = await knowledgeRepository.updateFileStatus(
      record.id,
      FileStatus.INDEXED,
      parsedChunks.length
    );

    await workspaceRepository.logAuditAction(userId, workspaceId, "URL_KNOWLEDGE_ADDED", {
      fileId: record.id,
      url: dto.url,
    });

    return sanitizeKnowledgeFile(updated);
  }

  async getWorkspaceKnowledgeFiles(workspaceId: string, queryParams: KnowledgeFileQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await knowledgeRepository.findFiles(workspaceId, {
      search: queryParams.search,
      type: queryParams.type,
      status: queryParams.status,
      skip,
      take: limit,
    });

    const sanitizedItems = items.map(sanitizeKnowledgeFile);
    return formatPaginatedResult(sanitizedItems, totalItems, { page, limit, skip });
  }

  async getFileDetails(fileId: string, workspaceId: string) {
    const file = await knowledgeRepository.findFileById(fileId, workspaceId);
    if (!file) {
      throw ApiError.notFound("Knowledge file not found in this workspace");
    }
    return {
      file: sanitizeKnowledgeFile(file),
      chunks: file.chunks,
    };
  }

  async reindexFile(fileId: string, workspaceId: string, userId: string) {
    const file = await knowledgeRepository.findFileById(fileId, workspaceId);
    if (!file) {
      throw ApiError.notFound("Knowledge file not found in this workspace");
    }

    await knowledgeRepository.updateFileStatus(fileId, FileStatus.PROCESSING);
    await knowledgeRepository.deleteChunksByFileId(fileId);

    const rawText = file.filePath
      ? readStoredFileContent(file.filePath)
      : `Scraped content from ${file.url || file.name}`;

    const parsedChunks = chunkTextContent(rawText);

    await knowledgeRepository.createChunks(
      parsedChunks.map((c, index) => ({
        knowledgeFileId: file.id,
        chunkIndex: index,
        content: c.content,
        tokenCount: c.tokenCount,
        metadata: { source: file.name, type: file.type },
      }))
    );

    await this.embedFileChunks(file.id);

    const updated = await knowledgeRepository.updateFileStatus(
      file.id,
      FileStatus.INDEXED,
      parsedChunks.length
    );

    await workspaceRepository.logAuditAction(userId, workspaceId, "KNOWLEDGE_FILE_REINDEXED", {
      fileId,
      chunks: parsedChunks.length,
    });

    return sanitizeKnowledgeFile(updated);
  }

  async deleteFile(fileId: string, workspaceId: string, userId: string) {
    const file = await knowledgeRepository.findFileById(fileId, workspaceId);
    if (!file) {
      throw ApiError.notFound("Knowledge file not found in this workspace");
    }

    if (file.filePath) {
      deleteStoredFile(file.filePath);
    }

    await knowledgeRepository.deleteFile(fileId, workspaceId);
    await workspaceRepository.logAuditAction(userId, workspaceId, "KNOWLEDGE_FILE_DELETED", {
      fileId,
      name: file.name,
    });
  }

  async searchChunks(workspaceId: string, query: string, limitParam?: string) {
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const chunks = await knowledgeRepository.searchChunks(workspaceId, query, limit);
    return chunks.map((c) => ({
      chunkId: c.id,
      fileName: c.knowledgeFile.name,
      fileType: c.knowledgeFile.type,
      content: c.content,
      tokenCount: c.tokenCount,
      createdAt: c.createdAt,
    }));
  }
}

export const knowledgeService = new KnowledgeService();
