import crypto from "crypto";
import { widgetRepository } from "../repositories/widget.repository";
import { agentRepository } from "../repositories/agent.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { chatRepository } from "../repositories/chat.repository";
import { chatService } from "./chat.service";
import { ApiError } from "../utils/apiError";
import {
  UpsertWidgetConfigDTO,
  PublicWidgetConfigResponse,
} from "../interfaces/widget.interface";

export function generateWidgetToken(): string {
  return "wgt_" + crypto.randomBytes(24).toString("hex");
}

function sanitizePublicConfig(config: any): PublicWidgetConfigResponse {
  return {
    widgetToken: config.widgetToken,
    title: config.title,
    welcomeMessage: config.welcomeMessage,
    theme: config.theme,
    primaryColor: config.primaryColor,
    launcherPosition: config.launcherPosition,
    launcherSize: config.launcherSize,
    showAvatar: config.showAvatar,
    avatarUrl: config.avatarUrl,
    allowFileUpload: config.allowFileUpload,
    enableRag: config.enableRag,
    prePrompt: config.prePrompt,
    agent: {
      id: config.agent.id,
      name: config.agent.name,
      avatarColor: config.agent.avatarColor,
      status: config.agent.status,
    },
  };
}

export class WidgetService {
  async upsertWidgetConfig(workspaceId: string, userId: string, agentId: string, dto: UpsertWidgetConfigDTO) {
    const agent = await agentRepository.findAgentById(agentId, workspaceId);
    if (!agent) {
      throw ApiError.notFound("Agent not found in this workspace");
    }

    const existing = await widgetRepository.findWidgetByAgent(agentId, workspaceId);
    const widgetToken = existing ? existing.widgetToken : generateWidgetToken();

    const config = await widgetRepository.upsertWidgetConfig(agentId, workspaceId, dto, widgetToken);

    await workspaceRepository.logAuditAction(userId, workspaceId, "WIDGET_CONFIGURED", {
      agentId,
      widgetId: config.id,
    });

    return config;
  }

  async getWidgetConfig(workspaceId: string, agentId: string) {
    const config = await widgetRepository.findWidgetByAgent(agentId, workspaceId);
    if (!config) {
      throw ApiError.notFound("Widget configuration not found for this agent");
    }
    return config;
  }

  async updateWidgetConfig(workspaceId: string, widgetId: string, userId: string, dto: UpsertWidgetConfigDTO) {
    const existing = await widgetRepository.findWidgetById(widgetId, workspaceId);
    if (!existing) {
      throw ApiError.notFound("Widget configuration not found in this workspace");
    }

    const config = await widgetRepository.updateWidget(widgetId, workspaceId, dto);

    await workspaceRepository.logAuditAction(userId, workspaceId, "WIDGET_UPDATED", {
      widgetId,
    });

    return config;
  }

  async deleteWidgetConfig(workspaceId: string, widgetId: string, userId: string) {
    const result = await widgetRepository.deleteWidget(widgetId, workspaceId);
    if (result.count === 0) {
      throw ApiError.notFound("Widget configuration not found in this workspace");
    }

    await workspaceRepository.logAuditAction(userId, workspaceId, "WIDGET_DELETED", {
      widgetId,
    });

    return { deleted: result.count };
  }

  async publishWidget(workspaceId: string, widgetId: string, userId: string) {
    const existing = await widgetRepository.findWidgetById(widgetId, workspaceId);
    if (!existing) {
      throw ApiError.notFound("Widget configuration not found in this workspace");
    }

    const config = await widgetRepository.updateWidget(widgetId, workspaceId, { isPublished: true });

    await workspaceRepository.logAuditAction(userId, workspaceId, "WIDGET_PUBLISHED", {
      widgetId,
    });

    return config;
  }

  async regenerateWidgetToken(workspaceId: string, widgetId: string, userId: string) {
    const existing = await widgetRepository.findWidgetById(widgetId, workspaceId);
    if (!existing) {
      throw ApiError.notFound("Widget configuration not found in this workspace");
    }

    const config = await widgetRepository.updateWidget(widgetId, workspaceId, {
      widgetToken: generateWidgetToken(),
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "WIDGET_TOKEN_ROTATED", {
      widgetId,
    });

    return config;
  }

  async getPublicWidgetConfig(token: string): Promise<PublicWidgetConfigResponse> {
    const config = await widgetRepository.findPublishedWidgetByToken(token);
    if (!config) {
      throw ApiError.notFound("Widget configuration not found or not published");
    }
    return sanitizePublicConfig(config);
  }

  async sendPublicWidgetMessage(token: string, message: string, sessionId?: string) {
    const config = await widgetRepository.findPublishedWidgetByToken(token);
    if (!config) {
      throw ApiError.notFound("Widget configuration not found or not published");
    }

    const agent = config.agent;

    // Reuse existing session if it belongs to this agent, otherwise create a new one
    let targetSessionId = sessionId;
    if (sessionId) {
      const session = await chatRepository.findSessionById(sessionId, config.workspaceId);
      if (!session || session.agentId !== agent.id) {
        targetSessionId = undefined;
      }
    }

    if (!targetSessionId) {
      const created = await chatService.createSession(config.workspaceId, agent.createdById, {
        agentId: agent.id,
        title: "Widget Chat",
      });
      targetSessionId = created.id;
    }

    const result = await chatService.sendMessage(config.workspaceId, agent.createdById, {
      sessionId: targetSessionId,
      content: message,
      enableRag: config.enableRag,
    });

    return {
      sessionId: targetSessionId,
      ...result,
    };
  }
}

export const widgetService = new WidgetService();
