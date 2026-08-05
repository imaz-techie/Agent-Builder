import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";
import type { SendMessageDto } from "@/types/conversation.types";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SendMessageDto) => conversationService.sendMessage(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.ALL });
    },
  });
}
