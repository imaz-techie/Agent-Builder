import { prisma } from "../database";
import { UpsertWidgetConfigDTO } from "../interfaces/widget.interface";

export class WidgetRepository {
  async upsertWidgetConfig(agentId: string, workspaceId: string, data: UpsertWidgetConfigDTO, widgetToken: string) {
    return prisma.chatWidgetConfig.upsert({
      where: { agentId },
      create: {
        agentId,
        workspaceId,
        widgetToken,
        ...data,
      },
      update: data,
      include: { agent: true },
    });
  }

  async findWidgetByAgent(agentId: string, workspaceId: string) {
    return prisma.chatWidgetConfig.findFirst({
      where: { agentId, workspaceId },
      include: { agent: true },
    });
  }

  async findWidgetById(id: string, workspaceId: string) {
    return prisma.chatWidgetConfig.findFirst({
      where: { id, workspaceId },
      include: { agent: true },
    });
  }

  async updateWidget(id: string, workspaceId: string, data: UpsertWidgetConfigDTO & { isPublished?: boolean; widgetToken?: string }) {
    return prisma.chatWidgetConfig.update({
      where: { id },
      data,
      include: { agent: true },
    });
  }

  async deleteWidget(id: string, workspaceId: string) {
    return prisma.chatWidgetConfig.deleteMany({
      where: { id, workspaceId },
    });
  }

  async findPublishedWidgetByToken(token: string) {
    return prisma.chatWidgetConfig.findFirst({
      where: { widgetToken: token, isPublished: true },
      include: { agent: true, workspace: true },
    });
  }

  async countPublishedWidgets(workspaceId: string) {
    return prisma.chatWidgetConfig.count({
      where: { workspaceId, isPublished: true },
    });
  }
}

export const widgetRepository = new WidgetRepository();
