import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trainingService } from "@/services/training.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import type {
  CreateTrainingDatasetDto,
  StartTrainingJobDto,
} from "@/types/training.types";

export function useCreateTrainingDatasetMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: CreateTrainingDatasetDto) => trainingService.createDataset(dto, workspaceId),
    onSuccess: (dataset) => {
      toast.success("Dataset registered", { description: dataset.name });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING.DATASETS(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to register dataset", { description: error.message });
    },
  });
}

export function useStartTrainingJobMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (dto: StartTrainingJobDto) => trainingService.startJob(dto, workspaceId),
    onSuccess: (job) => {
      toast.success("Training job queued", { description: job.jobName });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING.JOBS(workspaceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to start training job", { description: error.message });
    },
  });
}

export function useCancelTrainingJobMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (jobId: string) => trainingService.cancelJob(jobId, workspaceId),
    onSuccess: (job) => {
      toast.success("Training job cancelled", { description: job.jobName });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING.JOBS(workspaceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING.JOB_DETAIL(job.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel job", { description: error.message });
    },
  });
}

export function useRetryTrainingJobMutation() {
  const queryClient = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: (jobId: string) => trainingService.retryJob(jobId, workspaceId),
    onSuccess: (job) => {
      toast.success("Training job re-queued", { description: job.jobName });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING.JOBS(workspaceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING.JOB_DETAIL(job.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AGENTS.LIST(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error("Failed to retry job", { description: error.message });
    },
  });
}
