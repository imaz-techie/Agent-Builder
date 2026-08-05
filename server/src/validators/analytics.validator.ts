import { z } from "zod";

export const auditLogQuerySchema = z.object({
  query: z.object({
    action: z.string().optional(),
    userId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const exportAnalyticsQuerySchema = z.object({
  query: z.object({
    format: z.enum(["csv", "json"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
