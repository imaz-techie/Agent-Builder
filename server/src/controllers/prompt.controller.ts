import { Request, Response } from "express";
import { promptService } from "../services/prompt.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function createTemplate(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const template = await promptService.createTemplate(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Prompt template created successfully",
    data: { template },
  });
}

export async function getWorkspaceTemplates(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const category = req.query.category as string;

  const templates = await promptService.getWorkspaceTemplates(workspaceId, category);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Prompt templates retrieved",
    data: { templates },
  });
}

export async function getTemplateDetails(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const tParam = req.params.templateId || req.params.id;
  const templateId = Array.isArray(tParam) ? tParam[0] : tParam;

  const template = await promptService.getTemplateDetails(templateId, workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Prompt template details retrieved",
    data: { template },
  });
}

export async function updateTemplate(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const templateId = Array.isArray(req.params.templateId)
    ? req.params.templateId[0]
    : req.params.templateId;

  const template = await promptService.updateTemplate(
    templateId,
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Prompt template updated successfully",
    data: { template },
  });
}

export async function deleteTemplate(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const templateId = Array.isArray(req.params.templateId)
    ? req.params.templateId[0]
    : req.params.templateId;

  await promptService.deleteTemplate(templateId, workspaceId, req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Prompt template deleted successfully",
    data: {},
  });
}

export async function executePrompt(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const execution = await promptService.executePrompt(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Prompt executed successfully",
    data: { execution },
  });
}

export async function streamPromptExecution(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const dto = {
    templateId: req.query.templateId as string,
    agentId: req.query.agentId as string,
    systemPrompt: req.query.systemPrompt as string,
    userPrompt: req.query.userPrompt as string,
    variables: req.query.variables ? JSON.parse(req.query.variables as string) : undefined,
    model: req.query.model as never,
    temperature: req.query.temperature ? parseFloat(req.query.temperature as string) : undefined,
    maxTokens: req.query.maxTokens ? parseInt(req.query.maxTokens as string, 10) : undefined,
  };

  try {
    const execution = await promptService.streamPromptExecution(
      workspaceId,
      req.user!.id,
      dto,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );
    res.write(`data: ${JSON.stringify({ done: true, execution })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
}

export async function comparePrompts(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const comparisons = await promptService.comparePrompts(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Side-by-side prompt comparison completed",
    data: { comparisons },
  });
}

export async function getExecutionHistory(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const executions = await promptService.getExecutionHistory(workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Prompt execution history retrieved",
    data: { executions },
  });
}
