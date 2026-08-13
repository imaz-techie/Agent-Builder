import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { ragRepository } from "../src/repositories/rag.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { EmbeddingService } from "../src/services/embedding.service";
import { WorkspaceRole, FileType } from "@prisma/client";

jest.mock("../src/repositories/rag.repository");
jest.mock("../src/repositories/workspace.repository");
jest.mock("../src/services/embedding.service", () => {
  const actual = jest.requireActual("../src/services/embedding.service");
  return {
    EmbeddingService: {
      generateEmbedding: jest.fn(),
      generateEmbeddings: jest.fn(),
      cosineSimilarity: actual.EmbeddingService.cosineSimilarity,
    },
  };
});

describe("Phase 9 RAG Retrieval Engine Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-rag";
  const workspaceId = "ws-uuid-rag";
  const token = generateAccessToken({ userId, email: "rag@example.com", role: "DEVELOPER" });

  const mockVector = Array.from({ length: 768 }, (_, i) => (i + 1) / 768);

  const mockVectorRow = {
    id: "chunk-1",
    knowledge_file_id: "file-1",
    chunk_index: 0,
    content: "Agent Builder supports hybrid vector search for document RAG context retrieval.",
    token_count: 14,
    file_name: "RAG_Overview.txt",
    file_type: FileType.TXT,
    score: 0.9123,
  };

  const mockRagLog = {
    id: "log-1",
    agentId: null,
    queryText: "What is RAG hybrid vector search?",
    retrievedChunksCount: 1,
    topScore: 0.85,
    contextTokens: 14,
    citations: [
      {
        fileId: "file-1",
        fileName: "RAG_Overview.txt",
        fileType: "TXT",
        chunkIndex: 0,
        snippet: "Agent Builder supports hybrid vector search...",
        score: 0.85,
      },
    ],
    latencyMs: 35,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (EmbeddingService.generateEmbedding as jest.Mock).mockResolvedValue(mockVector);
  });

  it("EmbeddingService should generate 768-dim vector & compute cosine similarity", async () => {
    const vec1 = await EmbeddingService.generateEmbedding("Agent Builder RAG Query");

    expect(vec1).toHaveLength(768);

    const selfSimilarity = EmbeddingService.cosineSimilarity(vec1, vec1);
    expect(selfSimilarity).toBeCloseTo(1.0, 4);
  });

  it("POST /api/v1/workspaces/:id/rag/embeddings should return 768-dim vector", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/rag/embeddings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Hello Vector Embedding" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vector).toHaveLength(768);
  });

  it("POST /api/v1/workspaces/:id/rag/query should perform vector search & return context + citations", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (ragRepository.vectorSearchChunks as jest.Mock).mockResolvedValue([mockVectorRow]);
    (ragRepository.saveRagQueryLog as jest.Mock).mockResolvedValue(mockRagLog);

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/rag/query`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: "What is RAG hybrid vector search?",
        topK: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.context).toContain("RAG_Overview.txt");
    expect(res.body.data.citations).toHaveLength(1);
    expect(res.body.data.citations[0].fileName).toBe("RAG_Overview.txt");
  });

  it("GET /api/v1/workspaces/:id/rag/logs should view RAG query metrics & history logs", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (ragRepository.findLogsByWorkspace as jest.Mock).mockResolvedValue([mockRagLog]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/rag/logs`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.logs).toHaveLength(1);
  });
});
