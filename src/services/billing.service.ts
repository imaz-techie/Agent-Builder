import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  BillingAccount,
  BillingUsageSummary,
  Invoice,
  UpdatePlanResult,
} from "@/types/billing.types";

export const billingService = {
  async getAccount(workspaceId: string = "ws_default"): Promise<BillingAccount> {
    const response = await apiClient.get<ApiResponse<{ account: BillingAccount }>>(
      API_ENDPOINTS.BILLING.ACCOUNT(workspaceId)
    );
    return response.data.data.account;
  },

  async getInvoices(workspaceId: string = "ws_default"): Promise<Invoice[]> {
    const response = await apiClient.get<ApiResponse<{ invoices: Invoice[] }>>(
      API_ENDPOINTS.BILLING.INVOICES(workspaceId)
    );
    return response.data.data.invoices;
  },

  async getUsageSummary(workspaceId: string = "ws_default"): Promise<BillingUsageSummary> {
    const response = await apiClient.get<ApiResponse<{ summary: BillingUsageSummary }>>(
      API_ENDPOINTS.BILLING.USAGE(workspaceId)
    );
    return response.data.data.summary;
  },

  async updatePlan(workspaceId: string = "ws_default", plan: string): Promise<UpdatePlanResult> {
    const response = await apiClient.patch<ApiResponse<UpdatePlanResult>>(
      API_ENDPOINTS.BILLING.PLAN(workspaceId),
      { plan }
    );
    return response.data.data;
  },
};
