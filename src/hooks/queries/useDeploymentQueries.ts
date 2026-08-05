import { useQuery } from "@tanstack/react-query";
import { deploymentService } from "@/services/deployment.service";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useDeploymentsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.DEPLOYMENTS.ALL,
    queryFn: () => deploymentService.getDeployments(),
    staleTime: 60 * 1000,
  });
}
