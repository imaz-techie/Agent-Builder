import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiKeyService } from "@/services/apiKey.service";
import type { CreateApiKeyDto } from "@/types/apiKey.types";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) => apiKeyService.createApiKey(workspaceId, dto),
    onSuccess: () => {
      toast.success("API key created!");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to create API key", { description: error.message });
    },
  });
}

export function useRevokeApiKeyMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (keyId: string) => apiKeyService.revokeApiKey(workspaceId, keyId),
    onSuccess: () => {
      toast.success("API Key revoked");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to revoke key", { description: error.message });
    },
  });
}
