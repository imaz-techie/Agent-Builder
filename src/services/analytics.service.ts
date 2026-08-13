import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  AnalyticsOverview,
  UsageTimeSeriesPoint,
  AgentPerformance,
  AuditLogEntry,
} from "@/types/analytics.types";

export const analyticsService = {
  async getOverview(workspaceId: string = "ws_default"): Promise<AnalyticsOverview> {
    const response = await apiClient.get<ApiResponse<{ overview: AnalyticsOverview }>>(
      API_ENDPOINTS.ANALYTICS.OVERVIEW(workspaceId)
    );
    return response.data.data.overview;
  },

  async getUsage(workspaceId: string = "ws_default"): Promise<UsageTimeSeriesPoint[]> {
    const response = await apiClient.get<ApiResponse<{ usage: UsageTimeSeriesPoint[] }>>(
      API_ENDPOINTS.ANALYTICS.USAGE(workspaceId)
    );
    return response.data.data.usage;
  },

  async getAgentPerformance(workspaceId: string = "ws_default"): Promise<AgentPerformance[]> {
    const response = await apiClient.get<ApiResponse<{ agents: AgentPerformance[] }>>(
      API_ENDPOINTS.ANALYTICS.AGENTS(workspaceId)
    );
    return response.data.data.agents;
  },

  async getAuditLogs(workspaceId: string = "ws_default"): Promise<AuditLogEntry[]> {
    const response = await apiClient.get<ApiResponse<{ auditLogs: AuditLogEntry[] }>>(
      API_ENDPOINTS.ANALYTICS.AUDIT_LOGS(workspaceId)
    );
    return response.data.data.auditLogs;
  },
};
