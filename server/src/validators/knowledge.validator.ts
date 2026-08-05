import { z } from "zod";
import { FileType, FileStatus } from "@prisma/client";

export const addUrlSourceSchema = z.object({
  body: z.object({
    url: z.string().url("Invalid URL format"),
    name: z.string().optional(),
  }),
});

export const knowledgeQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    type: z.nativeEnum(FileType).optional(),
    status: z.nativeEnum(FileStatus).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const searchChunksSchema = z.object({
  query: z.object({
    query: z.string().min(1, "Search query is required"),
    limit: z.string().optional(),
  }),
});
