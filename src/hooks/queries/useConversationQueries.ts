import { useQuery } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useSessionsQuery(agentId?: string) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: [...QUERY_KEYS.CONVERSATIONS.SESSIONS(workspaceId), agentId],
    queryFn: () => conversationService.getSessions(workspaceId, agentId),
    staleTime: 30 * 1000,
  });
}

export function useSessionMessagesQuery(sessionId: string) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.CONVERSATIONS.MESSAGES(sessionId),
    queryFn: () => conversationService.getSessionMessages(sessionId, workspaceId),
    enabled: Boolean(sessionId),
    staleTime: 15 * 1000,
  });
}
