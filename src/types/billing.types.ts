export type BillingPlan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";

export type BillingStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";

export interface BillingAccount {
  id: string;
  workspaceId: string;
  plan: BillingPlan;
  status: BillingStatus;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  seats: number;
  monthlyTokenQuota: string;
  totalTokensUsed: string;
  totalSpendUsd: string;
  cancelAtPeriodEnd: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  accountId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  amountUsd: string;
  currency: string;
  description: string | null;
  stripeInvoiceId: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  issuedAt: string;
  paidAt: string | null;
  createdAt: string;
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

export interface UpdatePlanResult {
  account: BillingAccount;
  invoice: Invoice | null;
}
