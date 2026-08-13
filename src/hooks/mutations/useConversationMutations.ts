import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { conversationService } from "@/services/conversation.service";
import type { CreateSessionDto, SendMessageDto } from "@/types/conversation.types";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useCreateSessionMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: CreateSessionDto) => conversationService.createSession(workspaceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.SESSIONS(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to create session", { description: error.message });
    },
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: SendMessageDto) => conversationService.sendMessage(workspaceId, dto),
    onSuccess: (_, dto) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS.MESSAGES(dto.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.SESSIONS(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to send message", { description: error.message });
    },
  });
}
