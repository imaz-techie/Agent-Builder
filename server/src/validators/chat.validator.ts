import { z } from "zod";

export const createSessionSchema = z.object({
  body: z.object({
    agentId: z.string().uuid("Invalid Agent ID"),
    title: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid("Invalid Session ID"),
    content: z.string().min(1, "Message content cannot be empty"),
    enableRag: z.boolean().optional(),
  }),
});
