import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deploymentService } from "@/services/deployment.service";
import type { CreateDeploymentDto } from "@/types/deployment.types";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useCreateDeploymentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: CreateDeploymentDto) => deploymentService.createDeployment(dto, workspaceId),
    onSuccess: (dep) => {
      toast.success("Deployment created!", {
        description: `Deployed ${dep.agent?.name || dep.agentId} (v${dep.versionNumber}) to ${dep.environment.toLowerCase()}`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPLOYMENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Deployment failed", { description: error.message });
    },
  });
}

export function useRollbackDeploymentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (deploymentId: string) => deploymentService.rollbackDeployment(deploymentId, workspaceId),
    onSuccess: () => {
      toast.success("Deployment rolled back");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPLOYMENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Rollback failed", { description: error.message });
    },
  });
}

export function useDeleteDeploymentMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (deploymentId: string) => deploymentService.deleteDeployment(deploymentId, workspaceId),
    onSuccess: () => {
      toast.success("Deployment deleted");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPLOYMENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete deployment", { description: error.message });
    },
  });
}

