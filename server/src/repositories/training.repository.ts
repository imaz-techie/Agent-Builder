import { prisma } from "../database";
import { TrainingStatus, Prisma } from "@prisma/client";

export class TrainingRepository {
  async createDataset(data: {
    name: string;
    description?: string;
    version?: string;
    sampleCount?: number;
    fileSizeBytes?: number;
    filePath?: string;
    agentId?: string;
    workspaceId: string;
    createdById: string;
  }) {
    return prisma.trainingDataset.create({
      data: {
        name: data.name,
        description: data.description || null,
        version: data.version || "v1.0",
        sampleCount: data.sampleCount || 100,
        fileSizeBytes: BigInt(data.fileSizeBytes || 0),
        filePath: data.filePath || null,
        agentId: data.agentId || null,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findDatasetsByWorkspace(workspaceId: string) {
    return prisma.trainingDataset.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createJob(data: {
    jobName: string;
    agentId: string;
    datasetId?: string;
    epochs?: number;
    learningRate?: number;
    batchSize?: number;
    workspaceId: string;
    createdById: string;
  }) {
    const epochs = data.epochs || 3;
    return prisma.trainingJob.create({
      data: {
        jobName: data.jobName,
        agentId: data.agentId,
        datasetId: data.datasetId || null,
        status: TrainingStatus.QUEUED,
        epochs,
        totalEpochs: epochs,
        learningRate: data.learningRate || 0.0001,
        batchSize: data.batchSize || 8,
        progressPercent: 0.0,
        currentLoss: 1.0,
        trainingLogs: [`Job queued at ${new Date().toISOString()}`],
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },
    });
  }

  async findJobById(id: string, workspaceId: string) {
    return prisma.trainingJob.findFirst({
      where: { id, workspaceId },
      include: {
        agent: true,
        dataset: true,
      },
    });
  }

  async findJobsByWorkspace(
    workspaceId: string,
    params: {
      agentId?: string;
      status?: TrainingStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const where: Prisma.TrainingJobWhereInput = {
      workspaceId,
      ...(params.agentId ? { agentId: params.agentId } : {}),
      ...(params.status ? { status: params.status } : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.trainingJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip || 0,
        take: params.take || 10,
        include: { agent: true, dataset: true },
      }),
      prisma.trainingJob.count({ where }),
    ]);

    return { items, totalItems };
  }

  async updateJobProgress(
    id: string,
    data: {
      status?: TrainingStatus;
      currentEpoch?: number;
      progressPercent?: number;
      currentLoss?: number;
      errorMessage?: string;
      startedAt?: Date;
      completedAt?: Date;
    }
  ) {
    return prisma.trainingJob.update({
      where: { id },
      data,
    });
  }

  async appendJobLog(id: string, logLine: string) {
    const job = await prisma.trainingJob.findUnique({ where: { id } });
    if (!job) return;

    return prisma.trainingJob.update({
      where: { id },
      data: {
        trainingLogs: [...job.trainingLogs, logLine],
      },
    });
  }
}

export const trainingRepository = new TrainingRepository();
