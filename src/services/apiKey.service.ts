import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { ApiKey, ApiKeyWithSecret, CreateApiKeyDto } from "@/types/apiKey.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const apiKeyService = {
  async getApiKeys(workspaceId?: string): Promise<ApiKey[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ apiKeys: ApiKey[] }>>(
      API_ENDPOINTS.WORKSPACES.API_KEYS(wsId)
    );
    return response.data.data.apiKeys;
  },

  async createApiKey(dto: CreateApiKeyDto, workspaceId?: string): Promise<ApiKeyWithSecret> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ apiKey: ApiKeyWithSecret }>>(
      API_ENDPOINTS.WORKSPACES.API_KEYS(wsId),
      dto
    );
    return response.data.data.apiKey;
  },

  async revokeApiKey(keyId: string, workspaceId?: string): Promise<void> {
    const wsId = resolveWorkspaceId(workspaceId);
    await apiClient.delete<ApiResponse<unknown>>(
      API_ENDPOINTS.WORKSPACES.API_KEY_DETAIL(wsId, keyId)
    );
  },
};

