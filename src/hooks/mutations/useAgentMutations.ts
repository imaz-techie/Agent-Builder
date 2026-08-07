import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentService } from "@/services/agent.service";
import type { CreateAgentDto, UpdateAgentDto, Agent } from "@/types/agent.types";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useCreateAgentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: CreateAgentDto) => agentService.createAgent(dto, workspaceId),
    onSuccess: (newAgent) => {
      toast.success("Agent created successfully!", {
        description: `${newAgent.name} is ready for configuration.`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to create agent", { description: error.message });
    },
  });
}

export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
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

export function useCloneAgentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: ({ agentId, name }: { agentId: string; name?: string }) =>
      agentService.cloneAgent(agentId, workspaceId, name),
    onSuccess: (clonedAgent) => {
      toast.success("Agent cloned", { description: clonedAgent.name });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to clone agent", { description: error.message });
    },
  });
}

export function useArchiveAgentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (agentId: string) => agentService.archiveAgent(agentId, workspaceId),
    onSuccess: (agent) => {
      toast.success("Agent archived", { description: agent.name });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to archive agent", { description: error.message });
    },
  });
}

export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (agentId: string) => agentService.deleteAgent(agentId, workspaceId),
    onSuccess: () => {
      toast.success("Agent deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete agent", { description: error.message });
    },
  });
}
