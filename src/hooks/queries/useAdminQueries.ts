import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { QUERY_KEYS, STORAGE_KEYS } from "@/constants/api.constants";
import type {
  AdminUserQueryParams,
  AdminWorkspaceQueryParams,
  AdminSystemLogQueryParams,
} from "@/types/admin.types";

function useHasToken() {
  return Boolean(sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
}

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.STATS,
    queryFn: () => adminService.getStats(),
    enabled: useHasToken(),
    staleTime: 60 * 1000,
  });
}

export function useAdminTelemetryQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.TELEMETRY,
    queryFn: () => adminService.getTelemetry(),
    enabled: useHasToken(),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useAdminUsersQuery(params?: AdminUserQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.USERS(params as Record<string, unknown> | undefined),
    queryFn: () => adminService.getUsers(params),
    enabled: useHasToken(),
    staleTime: 30 * 1000,
  });
}

export function useAdminWorkspacesQuery(params?: AdminWorkspaceQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.WORKSPACES(params as Record<string, unknown> | undefined),
    queryFn: () => adminService.getWorkspaces(params),
    enabled: useHasToken(),
    staleTime: 30 * 1000,
  });
}

export function useAdminLogsQuery(params?: AdminSystemLogQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN.LOGS(params as Record<string, unknown> | undefined),
    queryFn: () => adminService.getSystemLogs(params),
    enabled: useHasToken(),
    staleTime: 15 * 1000,
  });
}
