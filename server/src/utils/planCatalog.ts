import { BillingPlan } from "@prisma/client";

export interface PlanMeta {
  plan: BillingPlan;
  name: string;
  pricePerMonthUsd: number;
  monthlyTokenQuota: number;
  seats: number;
  features: string[];
}

export const PLAN_CATALOG: Record<BillingPlan, PlanMeta> = {
  [BillingPlan.FREE]: {
    plan: BillingPlan.FREE,
    name: "Free",
    pricePerMonthUsd: 0,
    monthlyTokenQuota: 1_000_000,
    seats: 1,
    features: ["1M tokens/mo", "1 seat", "2 active agents"],
  },
  [BillingPlan.PRO]: {
    plan: BillingPlan.PRO,
    name: "Pro",
    pricePerMonthUsd: 20,
    monthlyTokenQuota: 10_000_000,
    seats: 5,
    features: ["10M tokens/mo", "5 seats", "Unlimited agents", "Priority support"],
  },
  [BillingPlan.BUSINESS]: {
    plan: BillingPlan.BUSINESS,
    name: "Business",
    pricePerMonthUsd: 79,
    monthlyTokenQuota: 50_000_000,
    seats: 25,
    features: ["50M tokens/mo", "25 seats", "SSO", "Custom domains"],
  },
  [BillingPlan.ENTERPRISE]: {
    plan: BillingPlan.ENTERPRISE,
    name: "Enterprise",
    pricePerMonthUsd: 499,
    monthlyTokenQuota: 500_000_000,
    seats: 500,
    features: ["500M tokens/mo", "Unlimited seats", "Dedicated infrastructure", "SLA"],
  },
};

export function getPlanMeta(plan: BillingPlan): PlanMeta {
  return PLAN_CATALOG[plan] || PLAN_CATALOG[BillingPlan.FREE];
}
