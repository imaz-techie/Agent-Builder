import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { ApiKey, ApiKeyWithSecret, CreateApiKeyDto } from "@/types/apiKey.types";

export const apiKeyService = {
  async getApiKeys(workspaceId: string = "ws_default"): Promise<ApiKey[]> {
    const response = await apiClient.get<ApiResponse<{ apiKeys: ApiKey[] }>>(
      API_ENDPOINTS.WORKSPACES.API_KEYS(workspaceId)
    );
    return response.data.data.apiKeys;
  },

  async createApiKey(workspaceId: string = "ws_default", dto: CreateApiKeyDto): Promise<ApiKeyWithSecret> {
    const response = await apiClient.post<ApiResponse<{ apiKey: ApiKeyWithSecret }>>(
      API_ENDPOINTS.WORKSPACES.API_KEYS(workspaceId),
      dto
    );
    return response.data.data.apiKey;
  },

  async revokeApiKey(workspaceId: string = "ws_default", keyId: string): Promise<void> {
    await apiClient.delete<ApiResponse<unknown>>(
      API_ENDPOINTS.WORKSPACES.API_KEY_DETAIL(workspaceId, keyId)
    );
  },
};
