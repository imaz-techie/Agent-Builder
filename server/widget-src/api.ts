import type { WidgetConfig } from "./WidgetApp";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function fetchWidgetConfig(
  apiBaseUrl: string,
  token: string
): Promise<WidgetConfig> {
  const res = await fetch(`${apiBaseUrl}/public/widgets/${encodeURIComponent(token)}/config`);
  const body = await handleResponse<{ data: { config: WidgetConfig } }>(res);
  return body.data.config;
}

export async function createWidgetSession(
  apiBaseUrl: string,
  token: string
): Promise<{ sessionId: string }> {
  const res = await fetch(`${apiBaseUrl}/public/widgets/${encodeURIComponent(token)}/session`, {
    method: "POST",
  });
  const body = await handleResponse<{ data: { sessionId: string } }>(res);
  return body.data;
}

export function streamWidgetMessage(
  apiBaseUrl: string,
  token: string,
  sessionId: string,
  content: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = new URL(
      `${apiBaseUrl}/public/widgets/${encodeURIComponent(token)}/stream`
    );
    url.searchParams.set("sessionId", sessionId);
    url.searchParams.set("content", content);

    const source = new EventSource(url.toString());
    source.onmessage = (event) => {
      if (event.data === "[DONE]") {
        source.close();
        resolve();
        return;
      }
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.error) {
          source.close();
          reject(new Error(parsed.error));
          return;
        }
        if (parsed.sessionId) {
          return;
        }
        if (parsed.chunk) {
          onChunk(parsed.chunk);
        }
      } catch {
        source.close();
        reject(new Error("Failed to parse stream payload"));
      }
    };
    source.onerror = () => {
      source.close();
      reject(new Error("Stream connection closed unexpectedly"));
    };
    if (signal) {
      signal.addEventListener("abort", () => source.close());
    }
  });
}
