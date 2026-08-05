import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentService } from "@/services/agent.service";
import type { CreateAgentDto, UpdateAgentDto, Agent } from "@/types/agent.types";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useCreateAgentMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAgentDto) => agentService.createAgent(dto, workspaceId),
    onSuccess: (newAgent) => {
      toast.success("Agent created successfully!", {
        description: `${newAgent.name} is ready for configuration.`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.ALL });
    },
    onError: (error: Error) => {
      toast.error("Failed to create agent", { description: error.message });
    },
  });
}

export function useUpdateAgentMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, dto }: { agentId: string; dto: UpdateAgentDto }) =>
      agentService.updateAgent(agentId, dto, workspaceId),
    onMutate: async ({ agentId, dto }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.AGENTS.DETAIL(agentId) });
      const previousAgent = queryClient.getQueryData<Agent>(QUERY_KEYS.AGENTS.DETAIL(agentId));

      if (previousAgent) {
        queryClient.setQueryData<Agent>(QUERY_KEYS.AGENTS.DETAIL(agentId), {
          ...previousAgent,
          ...dto,
        });
      }

      return { previousAgent };
    },
    onSuccess: (updatedAgent) => {
      toast.success("Agent updated", { description: updatedAgent.name });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.ALL });
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousAgent) {
        queryClient.setQueryData(
          QUERY_KEYS.AGENTS.DETAIL(variables.agentId),
          context.previousAgent
        );
      }
      toast.error("Failed to update agent", { description: error.message });
    },
  });
}

export function useDeleteAgentMutation(workspaceId: string = "ws_default") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => agentService.deleteAgent(agentId, workspaceId),
    onSuccess: () => {
      toast.success("Agent deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.ALL });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete agent", { description: error.message });
    },
  });
}
