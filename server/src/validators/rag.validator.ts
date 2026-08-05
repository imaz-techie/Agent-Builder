import { z } from "zod";

export const ragQuerySchema = z.object({
  body: z.object({
    agentId: z.string().uuid().optional(),
    query: z.string().min(1, "Query string is required"),
    topK: z.number().int().min(1).max(20).optional(),
    maxTokensContext: z.number().int().min(256).max(8192).optional(),
  }),
});

export const generateEmbeddingsSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Text is required to generate embeddings"),
    model: z.string().optional(),
  }),
});
