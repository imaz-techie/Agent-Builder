import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { widgetService } from "@/services/widget.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import type { UpsertWidgetConfigDto } from "@/types/widget.types";

export function useUpsertWidgetConfigMutation(agentId: string | null) {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: UpsertWidgetConfigDto) =>
      widgetService.upsertWidgetConfig(agentId!, dto, workspaceId),
    onSuccess: (config) => {
      toast.success("Widget configuration saved");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WIDGET.CONFIG(agentId ?? "") });
      queryClient.setQueryData(QUERY_KEYS.WIDGET.CONFIG(agentId ?? ""), config);
    },
    onError: (error: Error) => {
      toast.error("Failed to save widget configuration", { description: error.message });
    },
  });
}

export function usePublishWidgetMutation(agentId: string | null) {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (widgetId: string) => widgetService.publishWidget(widgetId, workspaceId),
    onSuccess: (config) => {
      toast.success("Widget published");
      queryClient.setQueryData(QUERY_KEYS.WIDGET.CONFIG(agentId ?? ""), config);
    },
    onError: (error: Error) => {
      toast.error("Failed to publish widget", { description: error.message });
    },
  });
}

export function useRegenerateWidgetTokenMutation(agentId: string | null) {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (widgetId: string) => widgetService.regenerateWidgetToken(widgetId, workspaceId),
    onSuccess: (config) => {
      toast.success("Widget token regenerated");
      queryClient.setQueryData(QUERY_KEYS.WIDGET.CONFIG(agentId ?? ""), config);
    },
    onError: (error: Error) => {
      toast.error("Failed to regenerate token", { description: error.message });
    },
  });
}
