export type KnowledgeFileType = "PDF" | "DOCX" | "TXT" | "CSV" | "JSON" | "MARKDOWN" | "URL";

export type KnowledgeFileStatus = "INDEXED" | "PROCESSING" | "FAILED" | "PENDING";

export interface KnowledgeFile {
  id: string;
  name: string;
  type: KnowledgeFileType;
  sizeBytes: string;
  mimeType: string | null;
  filePath: string | null;
  url: string | null;
  status: KnowledgeFileStatus;
  chunksCount: number;
  errorMessage: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadKnowledgeFileDto {
  file: File;
  workspaceId?: string;
}

export function formatFileSize(sizeBytes: string | number): string {
  const bytes = typeof sizeBytes === "string" ? parseInt(sizeBytes, 10) : sizeBytes;
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
