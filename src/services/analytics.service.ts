import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  AnalyticsOverview,
  UsageTimeSeriesPoint,
  AgentPerformance,
  AuditLogEntry,
} from "@/types/analytics.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const analyticsService = {
  async getOverview(workspaceId?: string): Promise<AnalyticsOverview> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ overview: AnalyticsOverview }>>(
      API_ENDPOINTS.ANALYTICS.OVERVIEW(wsId)
    );
    return response.data.data.overview;
  },

  async getUsage(workspaceId?: string): Promise<UsageTimeSeriesPoint[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ usage: UsageTimeSeriesPoint[] }>>(
      API_ENDPOINTS.ANALYTICS.USAGE(wsId)
    );
    return response.data.data.usage;
  },

  async getAgentPerformance(workspaceId?: string): Promise<AgentPerformance[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ agents: AgentPerformance[] }>>(
      API_ENDPOINTS.ANALYTICS.AGENTS(wsId)
    );
    return response.data.data.agents;
  },

  async getAuditLogs(workspaceId?: string): Promise<AuditLogEntry[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ auditLogs: AuditLogEntry[] }>>(
      API_ENDPOINTS.ANALYTICS.AUDIT_LOGS(wsId)
    );
    return response.data.data.auditLogs;
  },
};

