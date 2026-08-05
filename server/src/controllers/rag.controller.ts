import { Request, Response } from "express";
import { ragService } from "../services/rag.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function queryRag(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const result = await ragService.queryRag(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "RAG query context and citations generated",
    data: result,
  });
}

export async function generateEmbeddings(req: Request, res: Response) {
  const result = ragService.generateEmbedding(req.body.text);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Embedding vector generated",
    data: result,
  });
}

export async function getRagLogs(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const logs = await ragService.getRagLogs(workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "RAG query logs retrieved",
    data: { logs },
  });
}
