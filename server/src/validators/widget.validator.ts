import { z } from "zod";
import { WidgetTheme, WidgetLauncherPosition } from "@prisma/client";

export const upsertWidgetConfigSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(120).optional(),
    welcomeMessage: z.string().min(1).max(500).optional(),
    theme: z.nativeEnum(WidgetTheme).optional(),
    primaryColor: z
      .string()
      .regex(/^#([0-9A-Fa-f]{6})$/, "Primary color must be a hex color code")
      .optional(),
    launcherPosition: z.nativeEnum(WidgetLauncherPosition).optional(),
    launcherSize: z.number().int().min(32).max(96).optional(),
    showAvatar: z.boolean().optional(),
    avatarUrl: z.string().url().optional().nullable(),
    allowFileUpload: z.boolean().optional(),
    enableRag: z.boolean().optional(),
    prePrompt: z.string().max(2000).optional().nullable(),
    customDomain: z.string().optional().nullable(),
  }),
});

export const publicWidgetChatSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required").max(8000),
    sessionId: z.string().optional(),
  }),
});
