import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { ApiKey, CreateApiKeyDto } from "@/types/apiKey.types";
import { apiKeys as mockApiKeys } from "@/lib/mock-data";

export const apiKeyService = {
  async getApiKeys(workspaceId: string = "ws_default"): Promise<ApiKey[]> {
    try {
      const response = await apiClient.get<ApiResponse<ApiKey[]>>(
        API_ENDPOINTS.WORKSPACES.API_KEYS(workspaceId)
      );
      return response.data.data;
    } catch {
      return mockApiKeys;
    }
  },

  async createApiKey(dto: CreateApiKeyDto, workspaceId: string = "ws_default"): Promise<ApiKey> {
    try {
      const response = await apiClient.post<ApiResponse<ApiKey>>(
        API_ENDPOINTS.WORKSPACES.API_KEYS(workspaceId),
        dto
      );
      return response.data.data;
    } catch {
      const newKey: ApiKey = {
        id: `ak_${Date.now()}`,
        name: dto.name,
        keyPreview: `af_${dto.name.toLowerCase().replace(/\s+/g, "_")}_****...${Math.random().toString(36).substring(2, 6)}`,
        permissions: dto.permissions,
        lastUsed: "Never",
        createdAt: new Date().toISOString(),
      };
      mockApiKeys.unshift(newKey);
      return newKey;
    }
  },

  async deleteApiKey(keyId: string, workspaceId: string = "ws_default"): Promise<void> {
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.WORKSPACES.API_KEYS(workspaceId)}/${keyId}`
      );
    } catch {
      const index = mockApiKeys.findIndex((k) => k.id === keyId);
      if (index !== -1) {
        mockApiKeys.splice(index, 1);
      }
    }
  },
};
