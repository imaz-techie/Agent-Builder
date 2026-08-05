import { BillingPlan, LlmModel } from "@prisma/client";

export interface UpdatePlanDTO {
  plan: BillingPlan;
}

export interface RecordUsageDTO {
  model: LlmModel;
  tokensUsed: number;
}

export interface BillingQueryParams {
  page?: string;
  limit?: string;
}

export interface BillingUsageSummary {
  plan: BillingPlan;
  planName: string;
  pricePerMonthUsd: number;
  monthlyTokenQuota: number;
  tokensUsed: number;
  tokensRemaining: number;
  percentUsed: number;
  estCostUsd: number;
  periodStart: string;
  periodEnd: string;
}
