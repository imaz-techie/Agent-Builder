export interface RagQueryDTO {
  agentId?: string;
  query: string;
  topK?: number;
  maxTokensContext?: number;
}

export interface GenerateEmbeddingsDTO {
  text: string;
  model?: string;
}

export interface CitationItem {
  fileId: string;
  fileName: string;
  fileType: string;
  chunkIndex: number;
  snippet: string;
  score: number;
}

export interface VectorChunkMatch {
  chunkId: string;
  fileId: string;
  fileName: string;
  fileType: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  score: number;
}

export interface ContextBuildResult {
  contextPrompt: string;
  contextTokens: number;
  citations: CitationItem[];
  retrievedCount: number;
  topScore: number;
}

export interface RagQueryLogResponse {
  id: string;
  agentId: string | null;
  queryText: string;
  retrievedChunksCount: number;
  topScore: number;
  contextTokens: number;
  citations: CitationItem[];
  latencyMs: number;
  workspaceId: string;
  createdAt: Date;
}
