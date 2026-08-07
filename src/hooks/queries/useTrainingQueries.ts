import { useQuery } from "@tanstack/react-query";
import { trainingService } from "@/services/training.service";
import { QUERY_KEYS } from "@/constants/api.constants";
import { useActiveWorkspaceId } from "@/hooks/queries/useWorkspaceQueries";
import type { TrainingJobQueryParams } from "@/types/training.types";

export function useTrainingDatasetsQuery() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.TRAINING.DATASETS(workspaceId),
    queryFn: () => trainingService.getDatasets(workspaceId),
    staleTime: 60 * 1000,
  });
}

export function useTrainingJobsQuery(params?: TrainingJobQueryParams) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: [...QUERY_KEYS.TRAINING.JOBS(workspaceId), params],
    queryFn: () => trainingService.getJobs(workspaceId, params),
    staleTime: 15 * 1000,
  });
}

export function useTrainingJobQuery(jobId: string | null) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.TRAINING.JOB_DETAIL(jobId ?? ""),
    queryFn: () => trainingService.getJobDetails(jobId!, workspaceId),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "IN_PROGRESS" || status === "QUEUED" ? 5000 : false;
    },
  });
}

export function useTrainingJobLogsQuery(jobId: string | null) {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    queryKey: QUERY_KEYS.TRAINING.JOB_LOGS(jobId ?? ""),
    queryFn: () => trainingService.getJobLogs(jobId!, workspaceId),
    enabled: Boolean(jobId),
    refetchInterval: (query) => (query.state.data ? 10000 : false),
  });
}
