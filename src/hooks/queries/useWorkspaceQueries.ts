import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace.service";
import { QUERY_KEYS, STORAGE_KEYS } from "@/constants/api.constants";
import { DEFAULT_WORKSPACE_ID } from "@/lib/workspace-id";

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACES.LIST,
    queryFn: () => workspaceService.getWorkspaces(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkspaceQuery(workspaceId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACES.DETAIL(workspaceId),
    queryFn: () => workspaceService.getWorkspaceDetails(workspaceId),
    enabled: Boolean(workspaceId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveWorkspaceId(): string {
  return sessionStorage.getItem(STORAGE_KEYS.WORKSPACE_ID) || DEFAULT_WORKSPACE_ID;
}
