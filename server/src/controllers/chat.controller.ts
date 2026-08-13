import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function createSession(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const session = await chatService.createSession(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 201,
    message: "Conversation session created",
    data: { session },
  });
}

export async function getWorkspaceSessions(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const agentId = req.query.agentId as string;

  const sessions = await chatService.getWorkspaceSessions(workspaceId, agentId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Conversation sessions retrieved",
    data: { sessions },
  });
}

export async function getSessionMessages(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;
  const sParam = req.params.sessionId || req.params.id;
  const sessionId = Array.isArray(sParam) ? sParam[0] : sParam;

  const messages = await chatService.getSessionMessages(sessionId, workspaceId);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Session messages retrieved",
    data: { messages },
  });
}

export async function sendMessage(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  const result = await chatService.sendMessage(
    workspaceId,
    req.user!.id,
    req.body
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Chat message processed successfully",
    data: result,
  });
}

export async function streamMessage(req: Request, res: Response) {
  const param = req.params.workspaceId || req.params.id;
  const workspaceId = Array.isArray(param) ? param[0] : param;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sessionId = req.query.sessionId as string;
  const content = req.query.content as string;

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  try {
    await chatService.streamMessage(
      workspaceId,
      req.user!.id,
      sessionId,
      content,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );
    clearInterval(heartbeat);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    clearInterval(heartbeat);
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
}
