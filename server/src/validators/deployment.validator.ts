import { z } from "zod";
import { DeploymentEnvironment, DeploymentStatus } from "@prisma/client";

export const createDeploymentSchema = z.object({
  body: z.object({
    agentId: z.string().min(1, "Agent ID is required"),
    environment: z.nativeEnum(DeploymentEnvironment).optional(),
    versionNumber: z.string().min(1).optional(),
    url: z.string().url("URL must be a valid URL").optional(),
    domain: z.string().optional(),
  }),
});

export const updateDeploymentSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DeploymentStatus).optional(),
    url: z.string().url("URL must be a valid URL").optional(),
    domain: z.string().optional(),
  }),
});

export const deploymentQuerySchema = z.object({
  query: z.object({
    agentId: z.string().optional(),
    environment: z.nativeEnum(DeploymentEnvironment).optional(),
    status: z.nativeEnum(DeploymentStatus).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
