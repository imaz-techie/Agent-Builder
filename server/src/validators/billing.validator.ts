import { z } from "zod";
import { BillingPlan, LlmModel } from "@prisma/client";

export const updatePlanSchema = z.object({
  body: z.object({
    plan: z.nativeEnum(BillingPlan),
  }),
});

export const billingQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const recordUsageSchema = z.object({
  body: z.object({
    model: z.nativeEnum(LlmModel),
    tokensUsed: z.number().int().positive(),
  }),
});
