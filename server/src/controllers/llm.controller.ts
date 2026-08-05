import { Request, Response } from "express";
import { llmService } from "../services/llm.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function generateCompletion(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const result = await llmService.generateCompletion(workspaceId, req.body);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "LLM completion generated successfully",
    data: { completion: result },
  });
}

export async function streamCompletion(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  // Set HTTP headers for Server-Sent Events (SSE) streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const options = {
    model: (req.query.model as any) || "GPT_4O",
    userPrompt: (req.query.userPrompt as string) || "Hello",
    systemPrompt: req.query.systemPrompt as string,
  };

  try {
    await llmService.streamCompletion(workspaceId, options, (chunk: string) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
}

export async function configureProvider(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const config = await llmService.configureProvider(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "LLM Provider configured successfully",
    data: { providerConfig: config },
  });
}

export async function getWorkspaceProviders(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const providers = await llmService.getWorkspaceProviders(workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Configured LLM providers retrieved",
    data: { providers },
  });
}

export async function testProviderConnection(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const pParam = req.params.providerId || req.params.id;
  const providerId = Array.isArray(pParam) ? pParam[0] : pParam;

  const result = await llmService.testProviderConnection(providerId, workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Provider connection test completed",
    data: result,
  });
}
