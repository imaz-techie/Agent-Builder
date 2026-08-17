import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  BillingAccount,
  BillingUsageSummary,
  Invoice,
  UpdatePlanResult,
} from "@/types/billing.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export const billingService = {
  async getAccount(workspaceId?: string): Promise<BillingAccount> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ account: BillingAccount }>>(
      API_ENDPOINTS.BILLING.ACCOUNT(wsId)
    );
    return response.data.data.account;
  },

  async getInvoices(workspaceId?: string): Promise<Invoice[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ invoices: Invoice[] }>>(
      API_ENDPOINTS.BILLING.INVOICES(wsId)
    );
    return response.data.data.invoices;
  },

  async getUsageSummary(workspaceId?: string): Promise<BillingUsageSummary> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ summary: BillingUsageSummary }>>(
      API_ENDPOINTS.BILLING.USAGE(wsId)
    );
    return response.data.data.summary;
  },

  async updatePlan(workspaceId: string | undefined, plan: string): Promise<UpdatePlanResult> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.patch<ApiResponse<UpdatePlanResult>>(
      API_ENDPOINTS.BILLING.PLAN(wsId),
      { plan }
    );
    return response.data.data;
  },
};

