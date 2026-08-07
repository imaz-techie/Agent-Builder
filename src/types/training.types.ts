export const TRAINING_STATUSES = [
  "QUEUED",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

export interface TrainingDataset {
  id: string;
  name: string;
  description: string | null;
  version: string;
  sampleCount: number;
  fileSizeBytes: string;
  filePath: string | null;
  agentId: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingJob {
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
  startedAt: string | null;
  completedAt: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingDatasetDto {
  name: string;
  description?: string;
  version?: string;
  sampleCount?: number;
  agentId?: string;
}

export interface StartTrainingJobDto {
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
  page?: number;
  limit?: number;
}

export function formatFileSize(sizeBytes: string | number): string {
  const bytes = Number(sizeBytes) || 0;
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
