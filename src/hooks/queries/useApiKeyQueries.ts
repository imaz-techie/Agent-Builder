import { useQuery } from "@tanstack/react-query";
import { apiKeyService } from "@/services/apiKey.service";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useApiKeysQuery(workspaceId: string = "ws_default") {
  return useQuery({
    queryKey: QUERY_KEYS.API_KEYS.LIST(workspaceId),
    queryFn: () => apiKeyService.getApiKeys(workspaceId),
    staleTime: 60 * 1000,
  });
}
