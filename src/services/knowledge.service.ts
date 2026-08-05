import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { KnowledgeFile } from "@/types/knowledge.types";
import { knowledgeFiles as mockKnowledgeFiles } from "@/lib/mock-data";

export const knowledgeService = {
  async getKnowledgeFiles(workspaceId: string = "ws_default"): Promise<KnowledgeFile[]> {
    try {
      const response = await apiClient.get<ApiResponse<KnowledgeFile[]>>(
        API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILES(workspaceId)
      );
      return response.data.data;
    } catch {
      return mockKnowledgeFiles;
    }
  },

  async uploadKnowledgeFile(file: File, workspaceId: string = "ws_default"): Promise<KnowledgeFile> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post<ApiResponse<KnowledgeFile>>(
        API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILES(workspaceId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    } catch {
      const newFile: KnowledgeFile = {
        id: `kf_${Date.now()}`,
        name: file.name,
        type: (file.name.split(".").pop() as KnowledgeFile["type"]) || "txt",
        status: "processing",
        chunks: 0,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString(),
      };
      mockKnowledgeFiles.unshift(newFile);
      return newFile;
    }
  },

  async deleteKnowledgeFile(fileId: string, workspaceId: string = "ws_default"): Promise<void> {
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILES(workspaceId)}/${fileId}`
      );
    } catch {
      const index = mockKnowledgeFiles.findIndex((f) => f.id === fileId);
      if (index !== -1) {
        mockKnowledgeFiles.splice(index, 1);
      }
    }
  },

  async reindexKnowledgeFile(fileId: string, workspaceId: string = "ws_default"): Promise<KnowledgeFile> {
    try {
      const response = await apiClient.post<ApiResponse<KnowledgeFile>>(
        `${API_ENDPOINTS.WORKSPACES.KNOWLEDGE_FILES(workspaceId)}/${fileId}/reindex`
      );
      return response.data.data;
    } catch {
      const found = mockKnowledgeFiles.find((f) => f.id === fileId);
      if (!found) throw new Error("File not found");
      found.status = "indexed";
      return found;
    }
  },
};
