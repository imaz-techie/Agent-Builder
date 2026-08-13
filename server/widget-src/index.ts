import { h, render } from "preact";
import { WidgetApp } from "./WidgetApp";
import { createStyleSheet } from "./styles";

export interface AgentWidgetOptions {
  token: string;
  apiBaseUrl?: string;
  origin?: string;
  launcherText?: string;
}

declare global {
  interface Window {
    AgentWidget: {
      init: (options: AgentWidgetOptions) => void;
    };
  }
}

const DEFAULT_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "https://agent-builder-api.onrender.com/api/v1";

function mount(options: AgentWidgetOptions): void {
  const apiBaseUrl = (options.apiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
  const origin = options.origin || window.location.origin;

  const host = document.createElement("div");
  host.id = "agent-widget-root";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  shadow.appendChild(createStyleSheet());

  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  render(
    h(WidgetApp, {
      token: options.token,
      apiBaseUrl,
      origin,
      launcherText: options.launcherText,
    }),
    mountPoint
  );
}

window.AgentWidget = {
  init: (options: AgentWidgetOptions) => {
    if (!options?.token) {
      console.error("[AgentWidget] Missing required option: token");
      return;
    }
    if (document.getElementById("agent-widget-root")) {
      return;
    }
    mount(options);
  },
};
