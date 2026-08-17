import { useQuery } from "@tanstack/react-query";
import { widgetService } from "@/services/widget.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import { isRealWorkspaceId } from "@/lib/workspace-id";

export function useWidgetConfigQuery(agentId: string | null) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.WIDGET.CONFIG(agentId ?? ""),
    queryFn: () => widgetService.getWidgetConfig(agentId!, workspaceId),
    enabled: Boolean(agentId) && isRealWorkspaceId(workspaceId),
    retry: false,
    staleTime: 30 * 1000,
  });
}
