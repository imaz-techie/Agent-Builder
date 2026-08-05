import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Invoice } from "@/types/billing.types";
import { invoices as mockInvoices } from "@/lib/mock-data";

export const billingService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice[]>>(
        API_ENDPOINTS.BILLING.INVOICES
      );
      return response.data.data;
    } catch {
      return mockInvoices;
    }
  },
};
