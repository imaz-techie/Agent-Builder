import { z } from "zod";
import { WorkspaceRole, ApiKeyPermission } from "@prisma/client";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Workspace name must be at least 2 characters long"),
    logoUrl: z.string().url("Invalid logo URL format").optional().or(z.literal("")),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Workspace name must be at least 2 characters long").optional(),
    logoUrl: z.string().url("Invalid logo URL format").optional().or(z.literal("")),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address format"),
    role: z.nativeEnum(WorkspaceRole).optional(),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(WorkspaceRole),
  }),
});

export const createApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(2, "API key name must be at least 2 characters long"),
    permissions: z.array(z.nativeEnum(ApiKeyPermission)).optional(),
    expiresInDays: z.number().int().positive().optional(),
  }),
});
