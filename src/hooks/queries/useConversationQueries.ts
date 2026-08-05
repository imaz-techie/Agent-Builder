import { useQuery } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useConversationsQuery(agentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CONVERSATIONS.LIST(agentId),
    queryFn: () => conversationService.getConversations(agentId),
    staleTime: 30 * 1000,
  });
}

export function useConversationQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CONVERSATIONS.DETAIL(id),
    queryFn: () => conversationService.getConversationById(id),
    enabled: Boolean(id),
  });
}
