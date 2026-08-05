import { z } from "zod";
import { Role } from "@prisma/client";

export const adminUserQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const adminWorkspaceQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const updateAdminUserSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role).optional(),
    isVerified: z.boolean().optional(),
  }),
});

export const systemLogQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    level: z.string().optional(),
  }),
});
