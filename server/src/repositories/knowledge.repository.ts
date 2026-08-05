import { prisma } from "../database";
import { FileType, FileStatus, Prisma } from "@prisma/client";

export class KnowledgeRepository {
  async createFile(data: {
    name: string;
    type: FileType;
    sizeBytes: number;
    mimeType?: string;
    filePath?: string;
    url?: string;
    status?: FileStatus;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.knowledgeFile.create({
      data: {
        name: data.name,
        type: data.type,
        sizeBytes: BigInt(data.sizeBytes),
        mimeType: data.mimeType || null,
        filePath: data.filePath || null,
        url: data.url || null,
        status: data.status || FileStatus.PENDING,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findFileById(id: string, workspaceId: string) {
    return prisma.knowledgeFile.findFirst({
      where: { id, workspaceId },
      include: {
        chunks: { orderBy: { chunkIndex: "asc" } },
      },
    });
  }

  async findFiles(
    workspaceId: string,
    params: {
      search?: string;
      type?: FileType;
      status?: FileStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const where: Prisma.KnowledgeFileWhereInput = {
      workspaceId,
      ...(params.type ? { type: params.type } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            name: { contains: params.search, mode: "insensitive" },
          }
        : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.knowledgeFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip || 0,
        take: params.take || 10,
      }),
      prisma.knowledgeFile.count({ where }),
    ]);

    return { items, totalItems };
  }

  async updateFileStatus(
    id: string,
    status: FileStatus,
    chunksCount?: number,
    errorMessage?: string
  ) {
    return prisma.knowledgeFile.update({
      where: { id },
      data: {
        status,
        ...(chunksCount !== undefined ? { chunksCount } : {}),
        ...(errorMessage !== undefined ? { errorMessage } : {}),
      },
    });
  }

  async createChunks(
    chunks: Array<{
      knowledgeFileId: string;
      chunkIndex: number;
      content: string;
      tokenCount: number;
      metadata?: Record<string, unknown>;
    }>
  ) {
    return prisma.documentChunk.createMany({
      data: chunks.map((c) => ({
        knowledgeFileId: c.knowledgeFileId,
        chunkIndex: c.chunkIndex,
        content: c.content,
        tokenCount: c.tokenCount,
        metadata: c.metadata ? JSON.parse(JSON.stringify(c.metadata)) : undefined,
      })),
    });
  }

  async deleteChunksByFileId(knowledgeFileId: string) {
    return prisma.documentChunk.deleteMany({
      where: { knowledgeFileId },
    });
  }

  async deleteFile(id: string, workspaceId: string) {
    return prisma.knowledgeFile.deleteMany({
      where: { id, workspaceId },
    });
  }

  async searchChunks(workspaceId: string, query: string, limit = 10) {
    return prisma.documentChunk.findMany({
      where: {
        knowledgeFile: { workspaceId },
        content: { contains: query, mode: "insensitive" },
      },
      include: {
        knowledgeFile: true,
      },
      take: limit,
    });
  }
}

export const knowledgeRepository = new KnowledgeRepository();
