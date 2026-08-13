import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  KnowledgeFile,
  KnowledgeFileDetails,
} from "@/types/knowledge.types";

export const knowledgeService = {
  async getKnowledgeFiles(workspaceId: string = "ws_default"): Promise<KnowledgeFile[]> {
    const response = await apiClient.get<ApiResponse<{ files: KnowledgeFile[] }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILES(workspaceId)
    );
    return response.data.data.files;
  },

  async getFileDetails(
    fileId: string,
    workspaceId: string = "ws_default"
  ): Promise<KnowledgeFileDetails> {
    const response = await apiClient.get<ApiResponse<KnowledgeFileDetails>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILE_DETAIL(workspaceId, fileId)
    );
    return response.data.data;
  },

  async uploadKnowledgeFile(file: File, workspaceId: string = "ws_default"): Promise<KnowledgeFile> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<{ file: KnowledgeFile }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_UPLOAD(workspaceId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data.file;
  },

  async addUrlSource(url: string, workspaceId: string = "ws_default", name?: string): Promise<KnowledgeFile> {
    const response = await apiClient.post<ApiResponse<{ file: KnowledgeFile }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_URL(workspaceId),
      { url, name }
    );
    return response.data.data.file;
  },

  async deleteKnowledgeFile(fileId: string, workspaceId: string = "ws_default"): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILE_DETAIL(workspaceId, fileId));
  },

  async reindexKnowledgeFile(fileId: string, workspaceId: string = "ws_default"): Promise<KnowledgeFile> {
    const response = await apiClient.post<ApiResponse<{ file: KnowledgeFile }>>(
      API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILE_REINDEX(workspaceId, fileId)
    );
    return response.data.data.file;
  },
};
