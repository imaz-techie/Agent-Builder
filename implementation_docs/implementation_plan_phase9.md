# Implementation Plan - Phase 9: RAG Retrieval Engine & Citation Engine

This plan details the implementation of **Phase 9 (RAG Engine, Vector Embeddings Engine, Similarity Search, Hybrid Search, Retriever, Context Builder, Citation Engine, and RAG Query Logging)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Embeddings Engine & Vector Math**: Cosine similarity vector matching and embedding generator (supporting 1536-dim embeddings like `text-embedding-3-small`).
> - **Hybrid Search & Retriever**: Combining keyword matching (BM25 style) and vector similarity search for optimal RAG precision.
> - **Context Builder & Token Windowing**: Formatting retrieved document chunks into formatted system context windows with strict token budget limits.
> - **Citation Engine**: Tracking source document citations (`fileId`, `fileName`, `chunkIndex`, `pageNumber`, `snippet`) attached to generated agent responses.
> - **Prisma Schema Expansion**: Adding `RagQueryLog` model to track query latency, retrieved chunk count, top similarity scores, and citations.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add model:
- `RagQueryLog`: `id`, `agentId`, `queryText`, `retrievedChunksCount`, `topScore`, `contextTokens`, `citations` (JSON array), `latencyMs`, `workspaceId`, `createdById`, timestamps.

### 2. DTOs & Interfaces (`server/src/interfaces/rag.interface.ts`)
- `RagQueryDTO`, `VectorChunkMatch`, `CitationItem`, `ContextBuildResult`, `RagQueryResponse`.

### 3. Validation Schemas (`server/src/validators/rag.validator.ts`)
Zod validation schemas for:
- `ragQuerySchema`, `generateEmbeddingsSchema`.

### 4. Vector & Embedding Engine (`server/src/services/embedding.service.ts`)
- `generateEmbedding`: Generates 1536-dimensional float vector embeddings for text.
- `cosineSimilarity`: Vector dot product calculation for semantic similarity scoring.

### 5. Repository Layer (`server/src/repositories/rag.repository.ts`)
Database access methods:
- `searchChunksVector`: Semantic vector & keyword similarity search across `DocumentChunk` records.
- `saveRagQueryLog`: Log RAG query metrics and citation arrays.
- `getRagQueryHistory`: List past RAG query metrics.

### 6. Service Layer (`server/src/services/rag.service.ts`)
Business logic:
- `retrieveContext`: Execute hybrid retrieval (vector similarity + text matching).
- `buildPromptContext`: Format retrieved chunks into structured context window string with token limits.
- `generateCitationMap`: Build citation objects mapping chunks back to source `KnowledgeFile` records.
- `queryRag`: Full RAG pipeline: Query Embeddings -> Hybrid Retrieval -> Context Building -> Citation Generation -> History Logging.

### 7. Controller & Routes (`server/src/controllers/rag.controller.ts` & `server/src/routes/rag.routes.ts`)
REST Endpoints:
- `POST /api/v1/workspaces/:workspaceId/rag/query` -> Full RAG search & context builder endpoint
- `POST /api/v1/workspaces/:workspaceId/rag/embeddings` -> Generate text embedding vector
- `GET /api/v1/workspaces/:workspaceId/rag/logs` -> View RAG query metrics & citation history

### 8. Tests (`server/tests/rag.test.ts`)
Unit & integration tests covering embedding generation, cosine similarity vector calculation, hybrid search retrieval, context building, citation generation, and query logging.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/rag/query`, vector similarity calculation, context builder, and citations.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test sending a RAG query, verifying the returned system prompt context window, similarity scores, and citation source array.
