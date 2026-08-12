import type { AgentStatus } from "@/types/agent.types";

export const WIDGET_THEMES = ["LIGHT", "DARK", "SYSTEM"] as const;
export type WidgetTheme = (typeof WIDGET_THEMES)[number];

export const WIDGET_LAUNCHER_POSITIONS = ["BOTTOM_RIGHT", "BOTTOM_LEFT"] as const;
export type WidgetLauncherPosition = (typeof WIDGET_LAUNCHER_POSITIONS)[number];

export interface ChatWidgetConfig {
  id: string;
  agentId: string;
  workspaceId: string;
  title: string;
  welcomeMessage: string;
  theme: WidgetTheme;
  primaryColor: string;
  launcherPosition: WidgetLauncherPosition;
  launcherSize: number;
  showAvatar: boolean;
  avatarUrl: string | null;
  allowFileUpload: boolean;
  enableRag: boolean;
  prePrompt: string | null;
  suggestedQuestions: string[];
  isPublished: boolean;
  widgetToken: string;
  customDomain: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertWidgetConfigDto {
  title?: string;
  welcomeMessage?: string;
  theme?: WidgetTheme;
  primaryColor?: string;
  launcherPosition?: WidgetLauncherPosition;
  launcherSize?: number;
  showAvatar?: boolean;
  avatarUrl?: string | null;
  allowFileUpload?: boolean;
  enableRag?: boolean;
  prePrompt?: string | null;
  suggestedQuestions?: string[];
  customDomain?: string | null;
}

export interface PublicWidgetAgent {
  id: string;
  name: string;
  avatarColor: string;
  status: AgentStatus;
}

export interface PublicWidgetConfig {
  widgetToken: string;
  title: string;
  welcomeMessage: string;
  theme: WidgetTheme;
  primaryColor: string;
  launcherPosition: WidgetLauncherPosition;
  launcherSize: number;
  showAvatar: boolean;
  avatarUrl: string | null;
  allowFileUpload: boolean;
  enableRag: boolean;
  prePrompt: string | null;
  suggestedQuestions: string[];
  agent: PublicWidgetAgent;
}
