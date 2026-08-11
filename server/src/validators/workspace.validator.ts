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

export const updateBrandingSchema = z.object({
  body: z.object({
    primaryColor: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color format")
      .optional(),
    accentColor: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color format")
      .optional(),
    faviconUrl: z.string().url("Invalid favicon URL format").optional().or(z.literal("")),
    bannerText: z.string().max(120, "Banner text must be under 120 characters").optional(),
  }),
});

export const updateSecuritySchema = z.object({
  body: z.object({
    ipWhitelist: z.array(z.string().min(3, "IP entry must be at least 3 characters")).max(50),
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
