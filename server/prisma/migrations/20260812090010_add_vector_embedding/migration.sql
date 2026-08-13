-- Enable pgvector extension (idempotent for fresh deployments)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add Gemini text-embedding-004 768-dim embedding column
ALTER TABLE "document_chunks" ADD COLUMN "embedding" vector(768);

-- HNSW cosine index for fast similarity search
CREATE INDEX idx_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);
