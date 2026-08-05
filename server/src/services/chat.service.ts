import { chatRepository } from "../repositories/chat.repository";
import { agentRepository } from "../repositories/agent.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { ragService } from "./rag.service";
import { llmService } from "./llm.service";
import { realtimeService } from "../realtime";
import { ApiError } from "../utils/apiError";
import {
  CreateSessionDTO,
  SendChatMessageDTO,
} from "../interfaces/chat.interface";
import { ChatMessage, ChatRole, ConversationSession } from "@prisma/client";

function sanitizeSession(session: ConversationSession) {
  return {
    id: session.id,
    agentId: session.agentId,
    title: session.title,
    metadata: session.metadata,
    workspaceId: session.workspaceId,
    createdById: session.createdById,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

function sanitizeMessage(message: ChatMessage) {
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role,
    content: message.content,
    tokensCount: message.tokensCount,
    latencyMs: message.latencyMs,
    citations: message.citations,
    workspaceId: message.workspaceId,
    createdById: message.createdById,
    createdAt: message.createdAt,
  };
}

export class ChatService {
  async createSession(workspaceId: string, userId: string, dto: CreateSessionDTO) {
    const agent = await agentRepository.findAgentById(dto.agentId, workspaceId);
    if (!agent) {
      throw ApiError.notFound("Agent not found in this workspace");
    }

    const session = await chatRepository.createSession({
      agentId: dto.agentId,
      title: dto.title || `Chat with ${agent.name}`,
      metadata: dto.metadata,
      workspaceId,
      createdById: userId,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "CHAT_SESSION_CREATED", {
      sessionId: session.id,
      agentId: agent.id,
    });

    return sanitizeSession(session);
  }

  async getWorkspaceSessions(workspaceId: string, agentId?: string) {
    if (agentId) {
      const sessions = await chatRepository.findSessionsByAgent(agentId, workspaceId);
      return sessions.map(sanitizeSession);
    }
    const sessions = await chatRepository.findSessionsByAgent("%", workspaceId);
    return sessions.map(sanitizeSession);
  }

  async getSessionMessages(sessionId: string, workspaceId: string) {
    const session = await chatRepository.findSessionById(sessionId, workspaceId);
    if (!session) {
      throw ApiError.notFound("Conversation session not found in this workspace");
    }

    const messages = await chatRepository.findMessagesBySession(sessionId, workspaceId);
    return messages.map(sanitizeMessage);
  }

  /**
   * Prompt Assembly Engine: Assembles Agent System Prompt + RAG Context + Conversation History + User Query
   */
  private async assembleSystemPrompt(
    agentSystemPrompt: string,
    workspaceId: string,
    userId: string,
    query: string,
    enableRag = true
  ) {
    let assembledSystem = agentSystemPrompt;
    let citations: any[] = [];

    if (enableRag) {
      const ragResult = await ragService.queryRag(workspaceId, userId, {
        query,
        topK: 3,
      });

      if (ragResult.context) {
        assembledSystem += `\n\n--- RAG RETRIEVED KNOWLEDGE CONTEXT ---\n${ragResult.context}\n--- END CONTEXT ---`;
        citations = ragResult.citations;
      }
    }

    return { assembledSystem, citations };
  }

  async sendMessage(workspaceId: string, userId: string, dto: SendChatMessageDTO) {
    const startTime = Date.now();

    const session = await chatRepository.findSessionById(dto.sessionId, workspaceId);
    if (!session) {
      throw ApiError.notFound("Conversation session not found in this workspace");
    }

    // 1. Save user chat message
    const userMessage = await chatRepository.createMessage({
      sessionId: dto.sessionId,
      role: ChatRole.USER,
      content: dto.content,
      tokensCount: Math.ceil(dto.content.length / 4),
      workspaceId,
      createdById: userId,
    });

    // 2. Assemble System Prompt with RAG Context
    const { assembledSystem, citations } = await this.assembleSystemPrompt(
      session.agent.systemPrompt,
      workspaceId,
      userId,
      dto.content,
      dto.enableRag ?? true
    );

    // 3. Call LLM Execution
    const llmResponse = await llmService.generateCompletion(workspaceId, {
      model: session.agent.model,
      systemPrompt: assembledSystem,
      userPrompt: dto.content,
      temperature: session.agent.temperature,
      maxTokens: session.agent.maxTokens,
    });

    const latencyMs = Date.now() - startTime;

    // 4. Save Assistant chat message with Citations & Metrics
    const assistantMessage = await chatRepository.createMessage({
      sessionId: dto.sessionId,
      role: ChatRole.ASSISTANT,
      content: llmResponse.content,
      tokensCount: llmResponse.tokensUsed,
      latencyMs,
      citations: citations.length > 0 ? citations : undefined,
      workspaceId,
      createdById: userId,
    });

    // Update agent chat counts & session timestamp
    await agentRepository.incrementAgentChats(session.agentId);
    await chatRepository.touchSession(session.id);

    const userMessageResponse = sanitizeMessage(userMessage);
    const assistantMessageResponse = sanitizeMessage(assistantMessage);

    realtimeService.emitToWorkspace(workspaceId, "chat:message", {
      sessionId: session.id,
      userMessage: userMessageResponse,
      assistantMessage: assistantMessageResponse,
    });

    return {
      userMessage: userMessageResponse,
      assistantMessage: assistantMessageResponse,
    };
  }

  async streamMessage(
    workspaceId: string,
    userId: string,
    sessionId: string,
    content: string,
    onChunk: (chunk: string) => void
  ) {
    const session = await chatRepository.findSessionById(sessionId, workspaceId);
    if (!session) {
      throw ApiError.notFound("Conversation session not found in this workspace");
    }

    await chatRepository.createMessage({
      sessionId,
      role: ChatRole.USER,
      content,
      tokensCount: Math.ceil(content.length / 4),
      workspaceId,
      createdById: userId,
    });

    const { assembledSystem, citations } = await this.assembleSystemPrompt(
      session.agent.systemPrompt,
      workspaceId,
      userId,
      content,
      true
    );

    let fullOutput = "";

    const llmResult = await llmService.streamCompletion(
      workspaceId,
      {
        model: session.agent.model,
        systemPrompt: assembledSystem,
        userPrompt: content,
        temperature: session.agent.temperature,
      },
      (chunk) => {
        fullOutput += chunk;
        onChunk(chunk);
      }
    );

    await chatRepository.createMessage({
      sessionId,
      role: ChatRole.ASSISTANT,
      content: fullOutput,
      tokensCount: llmResult.tokensUsed,
      citations: citations.length > 0 ? citations : undefined,
      workspaceId,
      createdById: userId,
    });

    await agentRepository.incrementAgentChats(session.agentId);
    await chatRepository.touchSession(session.id);
  }
}

export const chatService = new ChatService();
