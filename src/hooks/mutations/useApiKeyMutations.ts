import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiKeyService } from "@/services/apiKey.service";
import type { CreateApiKeyDto } from "@/types/apiKey.types";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useCreateApiKeyMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) => apiKeyService.createApiKey(dto, workspaceId),
    onSuccess: (key) => {
      toast.success("API key created!", {
        description: `Key name: ${key.name}`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS.ALL });
    },
    onError: (error: Error) => {
      toast.error("Failed to create API key", { description: error.message });
    },
  });
}

export function useDeleteApiKeyMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => apiKeyService.deleteApiKey(keyId, workspaceId),
    onSuccess: () => {
      toast.success("API Key revoked");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS.ALL });
    },
    onError: (error: Error) => {
      toast.error("Failed to revoke key", { description: error.message });
    },
  });
}
