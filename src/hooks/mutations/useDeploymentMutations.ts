import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deploymentService } from "@/services/deployment.service";
import type { CreateDeploymentDto } from "@/types/deployment.types";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useCreateDeploymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDeploymentDto) => deploymentService.createDeployment(dto),
    onSuccess: (dep) => {
      toast.success("Deployment initiated!", {
        description: `Deployed ${dep.agentName} (v${dep.version}) to ${dep.environment}`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEPLOYMENTS.ALL });
    },
    onError: (error: Error) => {
      toast.error("Deployment failed", { description: error.message });
    },
  });
}
