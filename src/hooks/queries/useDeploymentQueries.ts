import { useQuery } from "@tanstack/react-query";
import { deploymentService } from "@/services/deployment.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import { isRealWorkspaceId } from "@/lib/workspace-id";

export function useDeploymentsQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.DEPLOYMENTS.LIST(workspaceId),
    queryFn: () => deploymentService.getDeployments(workspaceId),
    enabled: isRealWorkspaceId(workspaceId),
    staleTime: 60 * 1000,
  });
}
