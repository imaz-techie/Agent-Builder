import { EventEmitter } from "events";

export type RealtimeScope = "user" | "workspace";

export interface BroadcastMessage {
  scope: RealtimeScope;
  target: string;
  event: string;
  payload: Record<string, unknown>;
}

/**
 * Decoupled real-time broadcast facade. Services emit events here without
 * depending on Socket.IO. The Socket.IO adapter subscribes and forwards to
 * connected clients. When no adapter is attached, emits are no-ops.
 */
class RealtimeService {
  private emitter = new EventEmitter();

  subscribe(handler: (message: BroadcastMessage) => void): () => void {
    this.emitter.on("broadcast", handler);
    return () => {
      this.emitter.off("broadcast", handler);
    };
  }

  emitToWorkspace(workspaceId: string, event: string, payload: Record<string, unknown>) {
    this.emitter.emit("broadcast", {
      scope: "workspace",
      target: workspaceId,
      event,
      payload,
    } as BroadcastMessage);
  }

  emitToUser(userId: string, event: string, payload: Record<string, unknown>) {
    this.emitter.emit("broadcast", {
      scope: "user",
      target: userId,
      event,
      payload,
    } as BroadcastMessage);
  }
}

export const realtimeService = new RealtimeService();
