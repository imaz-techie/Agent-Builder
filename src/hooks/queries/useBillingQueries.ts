import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { billingService } from "@/services/billing.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";

export function useBillingAccountQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.BILLING.ACCOUNT(workspaceId),
    queryFn: () => billingService.getAccount(workspaceId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvoicesQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.BILLING.INVOICES(workspaceId),
    queryFn: () => billingService.getInvoices(workspaceId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsageSummaryQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.BILLING.USAGE(workspaceId),
    queryFn: () => billingService.getUsageSummary(workspaceId),
    staleTime: 60 * 1000,
  });
}

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (plan: string) => billingService.updatePlan(workspaceId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLING.ACCOUNT(workspaceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLING.USAGE(workspaceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLING.INVOICES(workspaceId) });
      toast.success("Plan updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update plan", { description: error.message });
    },
  });
}
