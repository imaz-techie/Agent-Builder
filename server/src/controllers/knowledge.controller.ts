import { Request, Response } from "express";
import { knowledgeService } from "../services/knowledge.service";
import { sendApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export async function uploadKnowledgeFile(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  if (!req.file) {
    throw ApiError.badRequest("No file uploaded");
  }

  const result = await knowledgeService.uploadAndIngestFile(
    workspaceId,
    req.user!.id,
    req.file
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Document uploaded and indexed successfully",
    data: { file: result },
  });
}

export async function addUrlSource(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const result = await knowledgeService.addUrlSource(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Web URL source added and indexed successfully",
    data: { file: result },
  });
}

export async function getWorkspaceKnowledgeFiles(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const result = await knowledgeService.getWorkspaceKnowledgeFiles(
    workspaceId,
    req.query
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Knowledge base files retrieved",
    data: { files: result.items },
    meta: result.meta,
  });
}

export async function getFileDetails(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const fileId = Array.isArray(req.params.fileId)
    ? req.params.fileId[0]
    : req.params.fileId;

  const details = await knowledgeService.getFileDetails(fileId, workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Knowledge file details retrieved",
    data: details,
  });
}

export async function reindexFile(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const fileId = Array.isArray(req.params.fileId)
    ? req.params.fileId[0]
    : req.params.fileId;

  const result = await knowledgeService.reindexFile(
    fileId,
    workspaceId,
    req.user!.id
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Knowledge file reindexed successfully",
    data: { file: result },
  });
}

export async function deleteFile(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const fileId = Array.isArray(req.params.fileId)
    ? req.params.fileId[0]
    : req.params.fileId;

  await knowledgeService.deleteFile(fileId, workspaceId, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Knowledge file deleted successfully",
    data: {},
  });
}

export async function searchChunks(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const query = (req.query.query as string) || "";
  const limit = req.query.limit as string;

  const results = await knowledgeService.searchChunks(workspaceId, query, limit);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Document chunks searched",
    data: { results },
  });
}
