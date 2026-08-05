import { z } from "zod";
import { AgentStatus, LlmModel } from "@prisma/client";

export const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Agent name must be at least 2 characters long"),
    description: z.string().min(5, "Description must be at least 5 characters long"),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.nativeEnum(AgentStatus).optional(),
    model: z.nativeEnum(LlmModel).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(128).max(128000).optional(),
    systemPrompt: z.string().optional(),
    avatarColor: z.string().optional(),
  }),
});

export const updateAgentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Agent name must be at least 2 characters long").optional(),
    description: z.string().min(5, "Description must be at least 5 characters long").optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.nativeEnum(AgentStatus).optional(),
    model: z.nativeEnum(LlmModel).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(128).max(128000).optional(),
    systemPrompt: z.string().optional(),
    avatarColor: z.string().optional(),
    changelog: z.string().optional(),
  }),
});

export const cloneAgentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Cloned agent name must be at least 2 characters long").optional(),
  }),
});

export const agentQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.nativeEnum(AgentStatus).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
