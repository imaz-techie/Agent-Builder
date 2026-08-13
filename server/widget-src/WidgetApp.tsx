import { h, FunctionComponent } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { fetchWidgetConfig, createWidgetSession, streamWidgetMessage } from "./api";

export interface WidgetConfig {
  widgetToken: string;
  title: string;
  welcomeMessage: string;
  theme: string;
  primaryColor: string;
  launcherPosition: string;
  launcherSize: number;
  showAvatar: boolean;
  avatarUrl: string | null;
  allowFileUpload: boolean;
  enableRag: boolean;
  prePrompt: string | null;
  suggestedQuestions: string[];
  agent: {
    id: string;
    name: string;
    avatarColor: string;
    status: string;
  };
}

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

interface WidgetAppProps {
  token: string;
  apiBaseUrl: string;
  origin: string;
  launcherText?: string;
}

export const WidgetApp: FunctionComponent<WidgetAppProps> = ({
  token,
  apiBaseUrl,
  origin,
  launcherText,
}) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWidgetConfig(apiBaseUrl, token)
      .then(setConfig)
      .catch((err) => setError(err.message));
  }, [apiBaseUrl, token]);

  useEffect(() => {
    if (config) {
      const root = document.getElementById("agent-widget-root");
      const shadow = root?.shadowRoot;
      if (shadow) {
        shadow.host.style.setProperty("--ab-primary", config.primaryColor);
      }
    }
  }, [config]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (config && config.welcomeMessage && messages.length === 0) {
      setMessages([{ id: "welcome", role: "bot", content: config.welcomeMessage }]);
    }
  }, [config, messages.length]);

  async function ensureSession(): Promise<string> {
    if (sessionId) {
      return sessionId;
    }
    const created = await createWidgetSession(apiBaseUrl, token);
    setSessionId(created.sessionId);
    return created.sessionId;
  }

  async function handleSend(preset?: string) {
    const content = (preset ?? input).trim();
    if (!content || loading) {
      return;
    }

    const id = String(Date.now());
    setMessages((prev) => [...prev, { id, role: "user", content }]);
    setMessages((prev) => [...prev, { id: `${id}-stream`, role: "bot", content: "" }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const sid = await ensureSession();
      let streamed = "";
      await streamWidgetMessage(apiBaseUrl, token, sid, content, (chunk) => {
        streamed += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === `${id}-stream` ? { ...m, content: streamed } : m
          )
        );
      });
    } catch (err) {
      setError((err as Error).message);
      setMessages((prev) => prev.filter((m) => m.id !== `${id}-stream`));
    } finally {
      setLoading(false);
    }
  }

  const name = config?.agent?.name || "Assistant";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div class="ab-root">
      <button
        type="button"
        class="ab-launcher"
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "×" : launcherText || "💬"}
      </button>

      {open && (
        <div class="ab-panel" role="dialog" aria-label={name}>
          <div class="ab-header">
            {config?.showAvatar && (
              <div class="ab-avatar">
                {config?.avatarUrl ? (
                  <img src={config.avatarUrl} alt="" referrerpolicy="no-referrer" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
            )}
            <div class="ab-title">{config?.title || name}</div>
            <button type="button" class="ab-close" aria-label="Close chat" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {error && <div class="ab-error">{error}</div>}

          {!config && !error && <div class="ab-welcome">Loading...</div>}

          {config && (
            <div class="ab-messages" ref={scrollRef}>
              {messages.map((m) => (
                <div key={m.id} class={`ab-bubble ab-bubble--${m.role}`}>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div class="ab-bubble ab-bubble--bot" aria-live="polite">
                  …
                </div>
              )}
            </div>
          )}

          {config && messages.length <= 1 && config.suggestedQuestions.length > 0 && (
            <div class="ab-suggestions">
              {config.suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  class="ab-suggestion"
                  onClick={() => handleSend(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div class="ab-input-row">
            <textarea
              class="ab-input"
              rows={1}
              placeholder="Type your message..."
              value={input}
              disabled={loading}
              onChange={(e) => setInput((e.target as HTMLTextAreaElement).value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              class="ab-send"
              disabled={loading || !input.trim()}
              onClick={() => handleSend()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
