import { TrainingStatus } from "@prisma/client";

export interface CreateTrainingDatasetDTO {
  name: string;
  description?: string;
  version?: string;
  sampleCount?: number;
  agentId?: string;
}

export interface StartTrainingJobDTO {
  jobName: string;
  agentId: string;
  datasetId?: string;
  epochs?: number;
  learningRate?: number;
  batchSize?: number;
}

export interface TrainingJobQueryParams {
  agentId?: string;
  status?: TrainingStatus;
  page?: string;
  limit?: string;
}

export interface TrainingDatasetResponse {
  id: string;
  name: string;
  description: string | null;
  version: string;
  sampleCount: number;
  fileSizeBytes: string;
  agentId: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingJobResponse {
  id: string;
  jobName: string;
  agentId: string;
  datasetId: string | null;
  status: TrainingStatus;
  epochs: number;
  learningRate: number;
  batchSize: number;
  currentEpoch: number;
  totalEpochs: number;
  progressPercent: number;
  currentLoss: number;
  trainingLogs: string[];
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
