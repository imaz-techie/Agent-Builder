import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  ChatWidgetConfig,
  UpsertWidgetConfigDto,
} from "@/types/widget.types";

export const widgetService = {
  async getWidgetConfig(
    agentId: string,
    workspaceId: string = "ws_default"
  ): Promise<ChatWidgetConfig> {
    const response = await apiClient.get<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.CONFIG(workspaceId, agentId)
    );
    return response.data.data.config;
  },

  async upsertWidgetConfig(
    agentId: string,
    dto: UpsertWidgetConfigDto,
    workspaceId: string = "ws_default"
  ): Promise<ChatWidgetConfig> {
    const response = await apiClient.post<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.CONFIG(workspaceId, agentId),
      dto
    );
    return response.data.data.config;
  },

  async publishWidget(
    widgetId: string,
    workspaceId: string = "ws_default"
  ): Promise<ChatWidgetConfig> {
    const response = await apiClient.post<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.PUBLISH(workspaceId, widgetId)
    );
    return response.data.data.config;
  },

  async regenerateWidgetToken(
    widgetId: string,
    workspaceId: string = "ws_default"
  ): Promise<ChatWidgetConfig> {
    const response = await apiClient.post<ApiResponse<{ config: ChatWidgetConfig }>>(
      API_ENDPOINTS.WIDGET.TOKEN(workspaceId, widgetId)
    );
    return response.data.data.config;
  },
};
