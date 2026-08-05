import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { ragRepository } from "../src/repositories/rag.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { EmbeddingService } from "../src/services/embedding.service";
import { WorkspaceRole, FileType } from "@prisma/client";

jest.mock("../src/repositories/rag.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 9 RAG Retrieval Engine Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-rag";
  const workspaceId = "ws-uuid-rag";
  const token = generateAccessToken({ userId, email: "rag@example.com", role: "DEVELOPER" });

  const mockChunk = {
    id: "chunk-1",
    knowledgeFileId: "file-1",
    chunkIndex: 0,
    content: "Agent Builder supports hybrid vector search for document RAG context retrieval.",
    tokenCount: 14,
    metadata: null,
    createdAt: new Date(),
    knowledgeFile: {
      id: "file-1",
      name: "RAG_Overview.txt",
      type: FileType.TXT,
      workspaceId,
    },
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
  });

  it("EmbeddingService should generate 1536-dim vector & compute cosine similarity", () => {
    const vec1 = EmbeddingService.generateEmbedding("Agent Builder RAG Query");

    expect(vec1).toHaveLength(1536);

    const selfSimilarity = EmbeddingService.cosineSimilarity(vec1, vec1);
    expect(selfSimilarity).toBeCloseTo(1.0, 4);
  });

  it("POST /api/v1/workspaces/:id/rag/embeddings should return 1536-dim vector", async () => {
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
    expect(res.body.data.vector).toHaveLength(1536);
  });

  it("POST /api/v1/workspaces/:id/rag/query should perform hybrid search & return context + citations", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (ragRepository.fetchWorkspaceChunks as jest.Mock).mockResolvedValue([mockChunk]);
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
