import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD_STATS,
    queryFn: () => analyticsService.getDashboardStats(),
    staleTime: 60 * 1000,
  });
}

export function useMonthlyUsageQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.MONTHLY_USAGE,
    queryFn: () => analyticsService.getMonthlyUsage(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgentDistributionQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.AGENT_DISTRIBUTION,
    queryFn: () => analyticsService.getAgentDistribution(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActivityTimelineQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.TIMELINE,
    queryFn: () => analyticsService.getActivityTimeline(),
    staleTime: 60 * 1000,
  });
}
