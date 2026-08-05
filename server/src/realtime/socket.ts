import http from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { realtimeService } from "./index";

/**
 * Initializes the Socket.IO real-time server attached to the HTTP server.
 * Clients authenticate via the `token` handshake auth field (JWT access token).
 * Rooms: `user:{userId}` (personal) and `workspace:{workspaceId}` (joined via event).
 */
export function initRealtime(httpServer: http.Server): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication token required"));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Invalid or expired access token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as { userId: string };
    if (user) {
      socket.join(`user:${user.userId}`);
    }

    socket.on("workspace:join", (workspaceId: string) => {
      if (typeof workspaceId === "string") {
        socket.join(`workspace:${workspaceId}`);
      }
    });

    socket.on("workspace:leave", (workspaceId: string) => {
      if (typeof workspaceId === "string") {
        socket.leave(`workspace:${workspaceId}`);
      }
    });

    socket.on("disconnect", () => {
      // Rooms are cleaned up automatically on disconnect
    });
  });

  // Bridge broadcaster events to connected socket clients
  realtimeService.subscribe(({ scope, target, event, payload }) => {
    io.to(scope === "user" ? `user:${target}` : `workspace:${target}`).emit(event, payload);
  });

  return io;
}
