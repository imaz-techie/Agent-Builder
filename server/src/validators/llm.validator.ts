import { z } from "zod";
import { LlmModel, ProviderType } from "@prisma/client";

export const completionRequestSchema = z.object({
  body: z.object({
    model: z.nativeEnum(LlmModel),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required"),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(128).max(128000).optional(),
    stopSequences: z.array(z.string()).optional(),
  }),
});

export const configureProviderSchema = z.object({
  body: z.object({
    provider: z.nativeEnum(ProviderType),
    apiKey: z.string().min(1, "API key is required"),
    baseUrl: z.string().url("Invalid base URL format").optional().or(z.literal("")),
    isDefault: z.boolean().optional(),
    priority: z.number().int().min(1).max(10).optional(),
  }),
});
