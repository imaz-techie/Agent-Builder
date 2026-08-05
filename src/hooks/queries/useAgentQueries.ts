import { useQuery } from "@tanstack/react-query";
import { agentService } from "@/services/agent.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import type { AgentFilterQueryParams } from "@/types/agent.types";

export function useAgentsQuery(workspaceId: string = "ws_default", params?: AgentFilterQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.AGENTS.LIST(workspaceId), params],
    queryFn: () => agentService.getAgents(workspaceId, params),
    staleTime: 60 * 1000,
  });
}

export function useAgentQuery(agentId: string, workspaceId: string = "ws_default") {
  return useQuery({
    queryKey: QUERY_KEYS.AGENTS.DETAIL(agentId),
    queryFn: () => agentService.getAgentById(agentId, workspaceId),
    enabled: Boolean(agentId),
    staleTime: 60 * 1000,
  });
}
