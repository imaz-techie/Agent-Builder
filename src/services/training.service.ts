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

export interface TrainingJobsResult {
  jobs: TrainingJob[];
  meta?: PaginationMeta;
}

export const trainingService = {
  async getDatasets(workspaceId: string = "ws_default"): Promise<TrainingDataset[]> {
    const response = await apiClient.get<ApiResponse<{ datasets: TrainingDataset[] }>>(
      API_ENDPOINTS.TRAINING.DATASETS(workspaceId)
    );
    return response.data.data.datasets;
  },

  async createDataset(
    dto: CreateTrainingDatasetDto,
    workspaceId: string = "ws_default"
  ): Promise<TrainingDataset> {
    const response = await apiClient.post<ApiResponse<{ dataset: TrainingDataset }>>(
      API_ENDPOINTS.TRAINING.DATASETS(workspaceId),
      dto
    );
    return response.data.data.dataset;
  },

  async getJobs(
    workspaceId: string = "ws_default",
    params?: TrainingJobQueryParams
  ): Promise<TrainingJobsResult> {
    const response = await apiClient.get<ApiResponse<{ jobs: TrainingJob[] }>>(
      API_ENDPOINTS.TRAINING.JOBS(workspaceId),
      { params }
    );
    return { jobs: response.data.data.jobs, meta: response.data.meta as PaginationMeta | undefined };
  },

  async getJobDetails(
    jobId: string,
    workspaceId: string = "ws_default"
  ): Promise<TrainingJob> {
    const response = await apiClient.get<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOB_DETAIL(workspaceId, jobId)
    );
    return response.data.data.job;
  },

  async getJobLogs(
    jobId: string,
    workspaceId: string = "ws_default"
  ): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<{ logs: string[] }>>(
      API_ENDPOINTS.TRAINING.JOB_LOGS(workspaceId, jobId)
    );
    return response.data.data.logs;
  },

  async startJob(
    dto: StartTrainingJobDto,
    workspaceId: string = "ws_default"
  ): Promise<TrainingJob> {
    const response = await apiClient.post<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOBS(workspaceId),
      dto
    );
    return response.data.data.job;
  },

  async cancelJob(
    jobId: string,
    workspaceId: string = "ws_default"
  ): Promise<TrainingJob> {
    const response = await apiClient.post<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOB_CANCEL(workspaceId, jobId)
    );
    return response.data.data.job;
  },

  async retryJob(
    jobId: string,
    workspaceId: string = "ws_default"
  ): Promise<TrainingJob> {
    const response = await apiClient.post<ApiResponse<{ job: TrainingJob }>>(
      API_ENDPOINTS.TRAINING.JOB_RETRY(workspaceId, jobId)
    );
    return response.data.data.job;
  },
};
