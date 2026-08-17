import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  ChatWidgetConfig,
  UpsertWidgetConfigDto,
} from "@/types/widget.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const widgetService = {
  async getWidgetConfig(
    agentId: string,
    workspaceId?: string
  ): Promise<ChatWidgetConfig> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.CONFIG(wsId, agentId)
    );
    return response.data.data.config;
  },

  async upsertWidgetConfig(
    agentId: string,
    dto: UpsertWidgetConfigDto,
    workspaceId?: string
  ): Promise<ChatWidgetConfig> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.CONFIG(wsId, agentId),
      dto
    );
    return response.data.data.config;
  },

  async publishWidget(
    widgetId: string,
    workspaceId?: string
  ): Promise<ChatWidgetConfig> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.PUBLISH(wsId, widgetId)
    );
    return response.data.data.config;
  },

  async regenerateWidgetToken(
    widgetId: string,
    workspaceId?: string
  ): Promise<ChatWidgetConfig> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.TOKEN(wsId, widgetId)
    );
    return response.data.data.config;
  },
};

