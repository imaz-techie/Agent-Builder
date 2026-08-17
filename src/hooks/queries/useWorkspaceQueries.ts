import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace.service";
import { QUERY_KEYS, STORAGE_KEYS } from "@/constants/api.constants";
import { DEFAULT_WORKSPACE_ID, setActiveWorkspaceId, isRealWorkspaceId } from "@/lib/workspace-id";

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACES.LIST,
    queryFn: async () => {
      const workspaces = await workspaceService.getWorkspaces();
      if (workspaces && workspaces.length > 0) {
        const storedId = sessionStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
        const isValidStored = workspaces.some((w) => w.id === storedId);
        if (!storedId || !isValidStored) {
          setActiveWorkspaceId(workspaces[0].id);
        }
      }
      return workspaces;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkspaceQuery(workspaceId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACES.DETAIL(workspaceId),
    queryFn: () => workspaceService.getWorkspaceDetails(workspaceId),
    enabled: Boolean(workspaceId) && isRealWorkspaceId(workspaceId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveWorkspaceId(): string {
  const { data: workspaces } = useWorkspacesQuery();
  const storedId = sessionStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);

  if (workspaces && workspaces.length > 0) {
    const isValidStored = workspaces.some((w) => w.id === storedId);
    if (!storedId || !isValidStored) {
      const firstId = workspaces[0].id;
      setActiveWorkspaceId(firstId);
      return firstId;
    }
  }

  return storedId || DEFAULT_WORKSPACE_ID;
}

