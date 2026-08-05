import { FileType, FileStatus } from "@prisma/client";

export interface CreateKnowledgeFileDTO {
  name: string;
  type: FileType;
  sizeBytes?: number;
  mimeType?: string;
  filePath?: string;
  url?: string;
}

export interface AddUrlSourceDTO {
  url: string;
  name?: string;
}

export interface KnowledgeFileQueryParams {
  search?: string;
  type?: FileType;
  status?: FileStatus;
  page?: string;
  limit?: string;
}

export interface KnowledgeFileResponse {
  id: string;
  name: string;
  type: FileType;
  sizeBytes: string;
  mimeType: string | null;
  filePath: string | null;
  url: string | null;
  status: FileStatus;
  chunksCount: number;
  errorMessage: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunkResponse {
  id: string;
  knowledgeFileId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
