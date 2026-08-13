export function createStyleSheet(): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      --ab-primary: #3B82F6;
      --ab-bg: #ffffff;
      --ab-text: #1f2937;
      --ab-muted: #6b7280;
      --ab-border: #e5e7eb;
      --ab-user-bg: var(--ab-primary);
      --ab-user-text: #ffffff;
      --ab-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
      --ab-radius: 12px;
      --ab-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .ab-launcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--ab-primary);
      color: #ffffff;
      font-family: var(--ab-font);
      font-size: 22px;
      cursor: pointer;
      box-shadow: var(--ab-shadow);
      z-index: 2147483000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease;
    }

    .ab-launcher:hover {
      transform: scale(1.06);
    }

    .ab-panel {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: var(--ab-bg);
      color: var(--ab-text);
      font-family: var(--ab-font);
      border-radius: var(--ab-radius);
      box-shadow: var(--ab-shadow);
      border: 1px solid var(--ab-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483001;
      animation: ab-fade 0.15s ease;
    }

    @keyframes ab-fade {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ab-header {
      padding: 14px 16px;
      background: var(--ab-primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ab-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      overflow: hidden;
    }

    .ab-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ab-title {
      font-size: 15px;
      font-weight: 600;
      flex: 1;
    }

    .ab-close {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 6px;
    }

    .ab-welcome {
      padding: 14px 16px;
      font-size: 13px;
      color: var(--ab-muted);
      border-bottom: 1px solid var(--ab-border);
    }

    .ab-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ab-bubble {
      max-width: 82%;
      padding: 10px 12px;
      border-radius: var(--ab-radius);
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .ab-bubble--bot {
      background: #f3f4f6;
      color: var(--ab-text);
      align-self: flex-start;
      border-top-left-radius: 4px;
    }

    .ab-bubble--user {
      background: var(--ab-user-bg);
      color: var(--ab-user-text);
      align-self: flex-end;
      border-top-right-radius: 4px;
    }

    .ab-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px 10px;
    }

    .ab-suggestion {
      background: #eef2ff;
      color: var(--ab-primary);
      border: 1px solid var(--ab-border);
      border-radius: 16px;
      padding: 6px 12px;
      font-size: 12px;
      font-family: var(--ab-font);
      cursor: pointer;
    }

    .ab-suggestion:hover {
      background: #e0e7ff;
    }

    .ab-input-row {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--ab-border);
    }

    .ab-input {
      flex: 1;
      border: 1px solid var(--ab-border);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: var(--ab-font);
      color: var(--ab-text);
      outline: none;
      resize: none;
    }

    .ab-input:focus {
      border-color: var(--ab-primary);
    }

    .ab-input:disabled {
      opacity: 0.6;
    }

    .ab-send {
      background: var(--ab-primary);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0 16px;
      font-size: 14px;
      font-family: var(--ab-font);
      cursor: pointer;
    }

    .ab-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ab-error {
      padding: 8px 16px;
      font-size: 12px;
      color: #b91c1c;
      background: #fee2e2;
    }
  `;
  return style;
}
