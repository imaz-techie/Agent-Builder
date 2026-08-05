import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  DashboardStats,
  MonthlyUsage,
  AgentDistribution,
  ActivityTimelineItem,
} from "@/types/analytics.types";
import {
  dashboardStats as mockDashboardStats,
  monthlyUsage as mockMonthlyUsage,
  agentDistribution as mockAgentDistribution,
  activityTimeline as mockActivityTimeline,
} from "@/lib/mock-data";

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        API_ENDPOINTS.ANALYTICS.OVERVIEW
      );
      return response.data.data;
    } catch {
      return mockDashboardStats;
    }
  },

  async getMonthlyUsage(): Promise<MonthlyUsage[]> {
    try {
      const response = await apiClient.get<ApiResponse<MonthlyUsage[]>>(
        API_ENDPOINTS.ANALYTICS.USAGE
      );
      return response.data.data;
    } catch {
      return mockMonthlyUsage;
    }
  },

  async getAgentDistribution(): Promise<AgentDistribution[]> {
    try {
      const response = await apiClient.get<ApiResponse<AgentDistribution[]>>(
        API_ENDPOINTS.ANALYTICS.DISTRIBUTION
      );
      return response.data.data;
    } catch {
      return mockAgentDistribution;
    }
  },

  async getActivityTimeline(): Promise<ActivityTimelineItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ActivityTimelineItem[]>>(
        API_ENDPOINTS.ANALYTICS.TIMELINE
      );
      return response.data.data;
    } catch {
      return mockActivityTimeline;
    }
  },
};
