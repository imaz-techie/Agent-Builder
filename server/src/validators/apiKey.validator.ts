import { z } from "zod";
import { ApiKeyPermission } from "@prisma/client";

export const createApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Key name is required").max(100),
    permissions: z.array(z.nativeEnum(ApiKeyPermission)).optional(),
    expiresAt: z.string().datetime().optional().nullable(),
  }),
});

export const updateApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    permissions: z.array(z.nativeEnum(ApiKeyPermission)).optional(),
  }),
});
