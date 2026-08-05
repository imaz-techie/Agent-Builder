import { Request, Response } from "express";
import { trainingService } from "../services/training.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function createDataset(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const dataset = await trainingService.createDataset(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Fine-tuning dataset registered successfully",
    data: { dataset },
  });
}

export async function getWorkspaceDatasets(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const datasets = await trainingService.getWorkspaceDatasets(workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Workspace training datasets retrieved",
    data: { datasets },
  });
}

export async function startTrainingJob(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const job = await trainingService.startTrainingJob(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Training job queued successfully",
    data: { job },
  });
}

export async function getWorkspaceJobs(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const result = await trainingService.getWorkspaceJobs(workspaceId, req.query);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Training jobs retrieved",
    data: { jobs: result.items },
    meta: result.meta,
  });
}

export async function getJobDetails(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const jobId = Array.isArray(req.params.jobId)
    ? req.params.jobId[0]
    : req.params.jobId;

  const job = await trainingService.getJobDetails(jobId, workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Training job details retrieved",
    data: { job },
  });
}

export async function getJobLogs(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const jobId = Array.isArray(req.params.jobId)
    ? req.params.jobId[0]
    : req.params.jobId;

  const logs = await trainingService.getJobLogs(jobId, workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Training job execution logs retrieved",
    data: { logs },
  });
}

export async function cancelJob(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const jobId = Array.isArray(req.params.jobId)
    ? req.params.jobId[0]
    : req.params.jobId;

  const job = await trainingService.cancelJob(jobId, workspaceId, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Training job cancelled",
    data: { job },
  });
}

export async function retryJob(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const jobId = Array.isArray(req.params.jobId)
    ? req.params.jobId[0]
    : req.params.jobId;

  const job = await trainingService.retryJob(jobId, workspaceId, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Training job re-queued",
    data: { job },
  });
}
