import { apiClient } from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { ApiResponse, PaginationMeta } from "@/types/api.types";
import type {
  TrainingDataset,
  TrainingJob,
  CreateTrainingDatasetDto,
  StartTrainingJobDto,
  TrainingJobQueryParams,
} from "@/types/training.types";
import { resolveWorkspaceId } from "@/lib/workspace-id";

export interface TrainingJobsResult {
  jobs: TrainingJob[];
  meta?: PaginationMeta;
}

export const trainingService = {
  async getDatasets(workspaceId?: string): Promise<TrainingDataset[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ datasets: TrainingDataset[] }>>(
      API_ENDPOINTS.TRAINING.DATASETS(wsId)
    );
    return response.data.data.datasets;
  },

  async createDataset(
    dto: CreateTrainingDatasetDto,
    workspaceId?: string
  ): Promise<TrainingDataset> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ dataset: TrainingDataset }>>(
      API_ENDPOINTS.TRAINING.DATASETS(wsId),
      dto
    );
    return response.data.data.dataset;
  },

  async getJobs(
    workspaceId?: string,
    params?: TrainingJobQueryParams
  ): Promise<TrainingJobsResult> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ jobs: TrainingJob[] }, PaginationMeta>>(
      API_ENDPOINTS.TRAINING.JOBS(wsId),
      { params }
    );
    return { jobs: response.data.data.jobs, meta: response.data.meta };
  },

  async getJobDetails(
    jobId: string,
    workspaceId?: string
  ): Promise<TrainingJob> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOB_DETAIL(wsId, jobId)
    );
    return response.data.data.job;
  },

  async getJobLogs(
    jobId: string,
    workspaceId?: string
  ): Promise<string[]> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.get<ApiResponse<{ logs: string[] }>>(
      API_ENDPOINTS.TRAINING.JOB_LOGS(wsId, jobId)
    );
    return response.data.data.logs;
  },

  async startJob(
    dto: StartTrainingJobDto,
    workspaceId?: string
  ): Promise<TrainingJob> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOBS(wsId),
      dto
    );
    return response.data.data.job;
  },

  async cancelJob(
    jobId: string,
    workspaceId?: string
  ): Promise<TrainingJob> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOB_CANCEL(wsId, jobId)
    );
    return response.data.data.job;
  },

  async retryJob(
    jobId: string,
    workspaceId?: string
  ): Promise<TrainingJob> {
    const wsId = resolveWorkspaceId(workspaceId);
    const response = await apiClient.post<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOB_RETRY(wsId, jobId)
    );
    return response.data.data.job;
  },
};

