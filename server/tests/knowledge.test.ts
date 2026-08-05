import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { knowledgeRepository } from "../src/repositories/knowledge.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { FileStatus, FileType, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/knowledge.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 5 Knowledge Base Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-knowledge";
  const workspaceId = "ws-uuid-knowledge";
  const fileId = "file-uuid-doc-1";
  const token = generateAccessToken({ userId, email: "doc@example.com", role: "DEVELOPER" });

  const mockFile = {
    id: fileId,
    name: "Customer_Faq.txt",
    type: FileType.TXT,
    sizeBytes: BigInt(1024),
    mimeType: "text/plain",
    filePath: "uploads/test.txt",
    url: null,
    status: FileStatus.INDEXED,
    chunksCount: 3,
    errorMessage: null,
    workspaceId,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    chunks: [
      {
        id: "chunk-1",
        knowledgeFileId: fileId,
        chunkIndex: 0,
        content: "Frequently Asked Questions for customer refund policy.",
        tokenCount: 10,
        metadata: { source: "Customer_Faq.txt" },
        createdAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/v1/workspaces/:id/knowledge/upload should ingest file buffer and create chunks", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (knowledgeRepository.createFile as jest.Mock).mockResolvedValue(mockFile);
    (knowledgeRepository.createChunks as jest.Mock).mockResolvedValue({ count: 1 });
    (knowledgeRepository.updateFileStatus as jest.Mock).mockResolvedValue(mockFile);
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/knowledge/upload`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("Sample text document content for testing chunking engine"), "sample.txt");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file.name).toBe("Customer_Faq.txt");
  });

  it("POST /api/v1/workspaces/:id/knowledge/url should ingest web URL source", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (knowledgeRepository.createFile as jest.Mock).mockResolvedValue({
      ...mockFile,
      name: "https://docs.agentbuilder.ai/faq",
      type: FileType.URL,
      url: "https://docs.agentbuilder.ai/faq",
    });
    (knowledgeRepository.createChunks as jest.Mock).mockResolvedValue({ count: 1 });
    (knowledgeRepository.updateFileStatus as jest.Mock).mockResolvedValue({
      ...mockFile,
      name: "https://docs.agentbuilder.ai/faq",
      type: FileType.URL,
      url: "https://docs.agentbuilder.ai/faq",
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/knowledge/url`)
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://docs.agentbuilder.ai/faq" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file.url).toBe("https://docs.agentbuilder.ai/faq");
  });

  it("GET /api/v1/workspaces/:id/knowledge should list knowledge files", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (knowledgeRepository.findFiles as jest.Mock).mockResolvedValue({
      items: [mockFile],
      totalItems: 1,
    });

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/knowledge`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.files).toHaveLength(1);
  });

  it("GET /api/v1/workspaces/:id/knowledge/search should search document chunks", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (knowledgeRepository.searchChunks as jest.Mock).mockResolvedValue([
      {
        id: "chunk-1",
        knowledgeFileId: fileId,
        chunkIndex: 0,
        content: "Frequently Asked Questions for customer refund policy.",
        tokenCount: 10,
        createdAt: new Date(),
        knowledgeFile: mockFile,
      },
    ]);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/knowledge/search?query=refund`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results).toHaveLength(1);
    expect(res.body.data.results[0].content).toContain("refund policy");
  });

  it("DELETE /api/v1/workspaces/:id/knowledge/:fileId should delete document", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (knowledgeRepository.findFileById as jest.Mock).mockResolvedValue(mockFile);
    (knowledgeRepository.deleteFile as jest.Mock).mockResolvedValue({ count: 1 });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/v1/workspaces/${workspaceId}/knowledge/${fileId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
