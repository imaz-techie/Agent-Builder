import { z } from "zod";
import { LlmModel } from "@prisma/client";

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Template title must be at least 2 characters long"),
    description: z.string().optional(),
    category: z.string().optional(),
    systemPrompt: z.string().optional(),
    userPromptTemplate: z.string().min(1, "User prompt template is required"),
    model: z.nativeEnum(LlmModel).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(128).max(128000).optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Template title must be at least 2 characters long").optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    systemPrompt: z.string().optional(),
    userPromptTemplate: z.string().min(1, "User prompt template is required").optional(),
    model: z.nativeEnum(LlmModel).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(128).max(128000).optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const executePromptSchema = z.object({
  body: z.object({
    templateId: z.string().uuid().optional(),
    agentId: z.string().uuid().optional(),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required"),
    variables: z.record(z.string()).optional(),
    model: z.nativeEnum(LlmModel).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(128).max(128000).optional(),
  }),
});

export const comparePromptsSchema = z.object({
  body: z.object({
    userPrompt: z.string().min(1, "User prompt is required"),
    variables: z.record(z.string()).optional(),
    configs: z
      .array(
        z.object({
          name: z.string(),
          systemPrompt: z.string().optional(),
          model: z.nativeEnum(LlmModel),
          temperature: z.number().min(0).max(2).optional(),
        })
      )
      .min(2, "Provide at least 2 configs for comparison"),
  }),
});
