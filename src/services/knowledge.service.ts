import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  KnowledgeFile,
  KnowledgeFileDetails,
} from "@/types/knowledge.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const knowledgeService = {
  async getKnowledgeFiles(workspaceId?: string): Promise<KnowledgeFile[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ files: KnowledgeFile[] }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILES(wsId)
    );
    return response.data.data.files;
  },

  async getFileDetails(
    fileId: string,
    workspaceId?: string
  ): Promise<KnowledgeFileDetails> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<KnowledgeFileDetails>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILE_DETAIL(wsId, fileId)
    );
    return response.data.data;
  },

  async uploadKnowledgeFile(file: File, workspaceId?: string): Promise<KnowledgeFile> {
    const wsId = resolveWorkspaceId(workspaceId);
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<{ file: KnowledgeFile }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_UPLOAD(wsId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data.file;
  },

  async addUrlSource(url: string, workspaceId?: string, name?: string): Promise<KnowledgeFile> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ file: KnowledgeFile }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_URL(wsId),
      { url, name }
    );
    return response.data.data.file;
  },

  async deleteKnowledgeFile(fileId: string, workspaceId?: string): Promise<void> {
    const wsId = resolveWorkspaceId(workspaceId);
    await apiClient.delete(API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILE_DETAIL(wsId, fileId));
  },

  async reindexKnowledgeFile(fileId: string, workspaceId?: string): Promise<KnowledgeFile> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ file: KnowledgeFile }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILE_REINDEX(wsId, fileId)
    );
    return response.data.data.file;
  },
};

