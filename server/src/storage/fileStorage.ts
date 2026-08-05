import fs from "fs";
import path from "path";
import { FileType } from "@prisma/client";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function detectFileType(filename: string, mimeType?: string): FileType {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".pdf":
      return FileType.PDF;
    case ".docx":
      return FileType.DOCX;
    case ".txt":
      return FileType.TXT;
    case ".csv":
      return FileType.CSV;
    case ".json":
      return FileType.JSON;
    case ".md":
    case ".markdown":
      return FileType.MARKDOWN;
    default:
      if (mimeType?.includes("json")) return FileType.JSON;
      if (mimeType?.includes("csv")) return FileType.CSV;
      if (mimeType?.includes("pdf")) return FileType.PDF;
      return FileType.TXT;
  }
}

export function saveUploadedFile(filename: string, buffer: Buffer): { filePath: string; sizeBytes: number } {
  const uniqueName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const targetPath = path.join(UPLOADS_DIR, uniqueName);
  
  fs.writeFileSync(targetPath, buffer);

  return {
    filePath: targetPath,
    sizeBytes: buffer.length,
  };
}

export function deleteStoredFile(filePath: string): void {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Ignore cleanup error if already deleted
    }
  }
}

export function readStoredFileContent(filePath: string): string {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return "";
}
