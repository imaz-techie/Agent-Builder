import { z } from "zod";
import { TrainingStatus } from "@prisma/client";

export const createDatasetSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Dataset name must be at least 2 characters long"),
    description: z.string().optional(),
    version: z.string().optional(),
    sampleCount: z.number().int().positive().optional(),
    agentId: z.string().uuid().optional(),
  }),
});

export const startTrainingJobSchema = z.object({
  body: z.object({
    jobName: z.string().min(2, "Job name must be at least 2 characters long"),
    agentId: z.string().uuid("Invalid Agent ID"),
    datasetId: z.string().uuid().optional(),
    epochs: z.number().int().min(1).max(100).optional(),
    learningRate: z.number().positive().max(1).optional(),
    batchSize: z.number().int().positive().max(512).optional(),
  }),
});

export const trainingQuerySchema = z.object({
  query: z.object({
    agentId: z.string().optional(),
    status: z.nativeEnum(TrainingStatus).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
