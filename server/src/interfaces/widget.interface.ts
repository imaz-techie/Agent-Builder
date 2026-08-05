import {
  WidgetTheme,
  WidgetLauncherPosition,
} from "@prisma/client";

export interface UpsertWidgetConfigDTO {
  title?: string;
  welcomeMessage?: string;
  theme?: WidgetTheme;
  primaryColor?: string;
  launcherPosition?: WidgetLauncherPosition;
  launcherSize?: number;
  showAvatar?: boolean;
  avatarUrl?: string;
  allowFileUpload?: boolean;
  enableRag?: boolean;
  prePrompt?: string;
  customDomain?: string;
}

export interface PublicWidgetConfigResponse {
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
  agent: {
    id: string;
    name: string;
    avatarColor: string;
    status: string;
  };
}
