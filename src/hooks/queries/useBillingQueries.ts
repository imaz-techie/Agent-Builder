import { useQuery } from "@tanstack/react-query";
import { billingService } from "@/services/billing.service";
import { QUERY_KEYS } from "@/constants/api.constants";

export function useInvoicesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.BILLING.INVOICES,
    queryFn: () => billingService.getInvoices(),
    staleTime: 5 * 60 * 1000,
  });
}
