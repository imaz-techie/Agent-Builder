export type KnowledgeFileStatus = "indexed" | "processing" | "failed";

export type KnowledgeFileType =
  | "pdf"
  | "docx"
  | "txt"
  | "csv"
  | "md"
  | "json";

export interface KnowledgeFile {
  id: string;
  name: string;
  type: KnowledgeFileType;
  status: KnowledgeFileStatus;
  chunks: number;
  size: string;
  uploadedAt: string;
  url?: string;
}

export interface UploadKnowledgeFileDto {
  file: File;
  workspaceId?: string;
}
