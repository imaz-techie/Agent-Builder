import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useOverviewQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.OVERVIEW(workspaceId),
    queryFn: () => analyticsService.getOverview(workspaceId),
    staleTime: 60 * 1000,
  });
}

export function useUsageQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.USAGE(workspaceId),
    queryFn: () => analyticsService.getUsage(workspaceId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgentPerformanceQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.AGENTS(workspaceId),
    queryFn: () => analyticsService.getAgentPerformance(workspaceId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAuditLogsQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS.AUDIT_LOGS(workspaceId),
    queryFn: () => analyticsService.getAuditLogs(workspaceId),
    staleTime: 60 * 1000,
  });
}
