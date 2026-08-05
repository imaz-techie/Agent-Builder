# Implementation Plan - Phase 5: Knowledge Base & Document Storage

This plan details the implementation of **Phase 5 (Knowledge Base RAG Storage, File Uploads, Document Chunking, Dataset Management, and Search)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Prisma Schema Expansion**: Adding `KnowledgeFile` and `DocumentChunk` models to `server/prisma/schema.prisma`.
> - **File Types**: Enums `PDF`, `DOCX`, `TXT`, `CSV`, `JSON`, `MARKDOWN`, `URL`.
> - **Indexing Statuses**: Enums `INDEXED`, `PROCESSING`, `FAILED`, `PENDING`.
> - **Document Chunking & Processing**: Multi-character chunking algorithm (chunk size, overlap) with chunk content storage and metadata parsing.
> - **File Storage Utility**: Local filesystem storage helper in `server/src/storage/fileStorage.ts` (S3/Cloud-ready abstraction).
> - **Frontend Compatibility**: Matches the structure of [KnowledgeBasePage.tsx](file:///d:/Imaz/Imaz%20Projects/Agent%20Builder/src/pages/KnowledgeBasePage.tsx) so document listing, file dropzone uploads, chunk count indicators, and reindexing sync cleanly when `VITE_USE_API=true`.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add models & enums:
- `FileType`: `PDF`, `DOCX`, `TXT`, `CSV`, `JSON`, `MARKDOWN`, `URL`.
- `FileStatus`: `INDEXED`, `PROCESSING`, `FAILED`, `PENDING`.
- `KnowledgeFile`: `id`, `name`, `type`, `sizeBytes`, `mimeType`, `filePath`, `url`, `status`, `chunksCount`, `errorMessage`, `workspaceId`, `createdById`, timestamps.
- `DocumentChunk`: `id`, `knowledgeFileId`, `chunkIndex`, `content`, `tokenCount`, `metadata` (JSON), timestamps.

### 2. DTOs & Interfaces (`server/src/interfaces/knowledge.interface.ts`)
- `CreateKnowledgeFileDTO`, `AddUrlSourceDTO`, `KnowledgeFileQueryParams`, `ChunkDocumentDTO`, `KnowledgeFileResponse`, `DocumentChunkResponse`.

### 3. Storage Utility (`server/src/storage/fileStorage.ts`)
- File upload helper to store uploaded documents in `server/uploads/` (with fallback/extension validation).

### 4. Validation Schemas (`server/src/validators/knowledge.validator.ts`)
Zod validation schemas for:
- `createKnowledgeFileSchema`, `addUrlSourceSchema`, `knowledgeQuerySchema`, `reindexFileSchema`.

### 5. Repository Layer (`server/src/repositories/knowledge.repository.ts`)
Database access methods:
- `createFile`, `findById`, `findFiles` (search, type filter, pagination), `updateStatus`, `deleteFile`, `createChunks`, `getChunksByFileId`, `deleteChunksByFileId`.

### 6. Service Layer (`server/src/services/knowledge.service.ts`)
Business logic:
- `uploadAndIngestFile`: Save uploaded file, parse content, execute document chunker, store chunks, set status to `INDEXED`.
- `addUrlSource`: Ingest web URL content and index chunks.
- `getWorkspaceKnowledgeFiles`: Search, filter by file type, and paginate workspace documents.
- `reindexFile`: Reset chunks, re-run chunking algorithm, and update status.
- `deleteFile`: Remove chunks, delete physical file from disk, and remove database record.
- `searchDocumentChunks`: Text similarity search across chunks in workspace documents.

### 7. Controller & Routes (`server/src/controllers/knowledge.controller.ts` & `server/src/routes/knowledge.routes.ts`)
REST Endpoints:
- `POST /api/v1/workspaces/:workspaceId/knowledge/upload` -> File upload (multipart/form-data via `multer`)
- `POST /api/v1/workspaces/:workspaceId/knowledge/url` -> Ingest web URL
- `GET /api/v1/workspaces/:workspaceId/knowledge` -> List/Search knowledge files
- `GET /api/v1/workspaces/:workspaceId/knowledge/:id` -> Get file & chunk details
- `POST /api/v1/workspaces/:workspaceId/knowledge/:id/reindex` -> Reindex document
- `DELETE /api/v1/workspaces/:workspaceId/knowledge/:id` -> Delete document
- `GET /api/v1/workspaces/:workspaceId/knowledge/search` -> Text search chunks

### 8. Tests (`server/tests/knowledge.test.ts`)
Unit & integration tests covering file metadata registration, chunking engine, reindexing, and document deletion.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/knowledge` CRUD, chunking, reindexing, and search endpoints.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test uploading text/JSON files, checking generated document chunks count, reindexing, and text search across chunks.
