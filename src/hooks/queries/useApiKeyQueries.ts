import { useQuery } from "@tanstack/react-query";
import { apiKeyService } from "@/services/apiKey.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useApiKeysQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.API_KEYS.LIST(workspaceId),
    queryFn: () => apiKeyService.getApiKeys(workspaceId),
    staleTime: 60 * 1000,
  });
}
