import { trainingRepository } from "../repositories/training.repository";
import { agentRepository } from "../repositories/agent.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { realtimeService } from "../realtime";
import { ApiError } from "../utils/apiError";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import {
  CreateTrainingDatasetDTO,
  StartTrainingJobDTO,
  TrainingJobQueryParams,
} from "../interfaces/training.interface";
import { AgentStatus, TrainingJob, TrainingStatus } from "@prisma/client";

function sanitizeJob(job: TrainingJob) {
  return {
    id: job.id,
    jobName: job.jobName,
    agentId: job.agentId,
    datasetId: job.datasetId,
    status: job.status,
    epochs: job.epochs,
    learningRate: job.learningRate,
    batchSize: job.batchSize,
    currentEpoch: job.currentEpoch,
    totalEpochs: job.totalEpochs,
    progressPercent: job.progressPercent,
    currentLoss: job.currentLoss,
    trainingLogs: job.trainingLogs,
    errorMessage: job.errorMessage,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    workspaceId: job.workspaceId,
    createdById: job.createdById,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export class TrainingService {
  async createDataset(workspaceId: string, userId: string, dto: CreateTrainingDatasetDTO) {
    const dataset = await trainingRepository.createDataset({
      name: dto.name,
      description: dto.description,
      version: dto.version,
      sampleCount: dto.sampleCount,
      agentId: dto.agentId,
      workspaceId,
      createdById: userId,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "TRAINING_DATASET_CREATED", {
      datasetId: dataset.id,
      name: dataset.name,
    });

    return {
      ...dataset,
      fileSizeBytes: dataset.fileSizeBytes.toString(),
    };
  }

  async getWorkspaceDatasets(workspaceId: string) {
    const datasets = await trainingRepository.findDatasetsByWorkspace(workspaceId);
    return datasets.map((d) => ({
      ...d,
      fileSizeBytes: d.fileSizeBytes.toString(),
    }));
  }

  async startTrainingJob(workspaceId: string, userId: string, dto: StartTrainingJobDTO) {
    const agent = await agentRepository.findAgentById(dto.agentId, workspaceId);
    if (!agent) {
      throw ApiError.notFound("Agent not found in this workspace");
    }

    const job = await trainingRepository.createJob({
      jobName: dto.jobName,
      agentId: dto.agentId,
      datasetId: dto.datasetId,
      epochs: dto.epochs,
      learningRate: dto.learningRate,
      batchSize: dto.batchSize,
      workspaceId,
      createdById: userId,
    });

    // Update target agent status to TRAINING
    await agentRepository.updateAgent(agent.id, workspaceId, {
      status: AgentStatus.TRAINING,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "TRAINING_JOB_STARTED", {
      jobId: job.id,
      agentId: agent.id,
    });

    // Simulate async job progress in background
    setImmediate(() => this.runTrainingSimulation(job.id, workspaceId, agent.id));

    return sanitizeJob(job);
  }

  private async runTrainingSimulation(jobId: string, workspaceId: string, agentId: string) {
    try {
      await trainingRepository.updateJobProgress(jobId, {
        status: TrainingStatus.IN_PROGRESS,
        startedAt: new Date(),
        currentEpoch: 1,
        progressPercent: 33.3,
        currentLoss: 0.65,
      });

      await trainingRepository.appendJobLog(
        jobId,
        `[${new Date().toISOString()}] Training started. Epoch 1/3 - Loss: 0.65`
      );

      realtimeService.emitToWorkspace(workspaceId, "training:updated", {
        jobId,
        status: TrainingStatus.IN_PROGRESS,
        progressPercent: 33.3,
        currentLoss: 0.65,
      });

      // Transition to completed state
      await trainingRepository.updateJobProgress(jobId, {
        status: TrainingStatus.COMPLETED,
        currentEpoch: 3,
        progressPercent: 100.0,
        currentLoss: 0.12,
        completedAt: new Date(),
      });

      await trainingRepository.appendJobLog(
        jobId,
        `[${new Date().toISOString()}] Training completed successfully. Final Loss: 0.12`
      );

      realtimeService.emitToWorkspace(workspaceId, "training:updated", {
        jobId,
        status: TrainingStatus.COMPLETED,
        progressPercent: 100.0,
        currentLoss: 0.12,
      });

      // Set agent back to ACTIVE and update lastTrainingAt timestamp
      await agentRepository.updateAgent(agentId, workspaceId, {
        status: AgentStatus.ACTIVE,
        lastTrainingAt: new Date(),
      });
    } catch {
      await trainingRepository.updateJobProgress(jobId, {
        status: TrainingStatus.FAILED,
        errorMessage: "Training simulation error",
      });
    }
  }

  async getWorkspaceJobs(workspaceId: string, queryParams: TrainingJobQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await trainingRepository.findJobsByWorkspace(workspaceId, {
      agentId: queryParams.agentId,
      status: queryParams.status,
      skip,
      take: limit,
    });

    const sanitizedItems = items.map(sanitizeJob);
    return formatPaginatedResult(sanitizedItems, totalItems, { page, limit, skip });
  }

  async getJobDetails(jobId: string, workspaceId: string) {
    const job = await trainingRepository.findJobById(jobId, workspaceId);
    if (!job) {
      throw ApiError.notFound("Training job not found in this workspace");
    }
    return sanitizeJob(job);
  }

  async cancelJob(jobId: string, workspaceId: string, userId: string) {
    const job = await trainingRepository.findJobById(jobId, workspaceId);
    if (!job) {
      throw ApiError.notFound("Training job not found in this workspace");
    }

    if (job.status === TrainingStatus.COMPLETED || job.status === TrainingStatus.CANCELLED) {
      throw ApiError.badRequest(`Cannot cancel job in state [${job.status}]`);
    }

    const updated = await trainingRepository.updateJobProgress(jobId, {
      status: TrainingStatus.CANCELLED,
    });

    await trainingRepository.appendJobLog(
      jobId,
      `[${new Date().toISOString()}] Job cancelled by user.`
    );

    await agentRepository.updateAgent(job.agentId, workspaceId, {
      status: AgentStatus.ACTIVE,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "TRAINING_JOB_CANCELLED", {
      jobId,
    });

    return sanitizeJob(updated);
  }

  async retryJob(jobId: string, workspaceId: string, userId: string) {
    const originalJob = await trainingRepository.findJobById(jobId, workspaceId);
    if (!originalJob) {
      throw ApiError.notFound("Training job not found in this workspace");
    }

    return this.startTrainingJob(workspaceId, userId, {
      jobName: `${originalJob.jobName} (Retry)`,
      agentId: originalJob.agentId,
      datasetId: originalJob.datasetId || undefined,
      epochs: originalJob.epochs,
      learningRate: originalJob.learningRate,
      batchSize: originalJob.batchSize,
    });
  }

  async getJobLogs(jobId: string, workspaceId: string) {
    const job = await trainingRepository.findJobById(jobId, workspaceId);
    if (!job) {
      throw ApiError.notFound("Training job not found in this workspace");
    }
    return job.trainingLogs;
  }
}

export const trainingService = new TrainingService();
