# Implementation Plan - Phase 13: Real-Time Streaming (SSE & Socket.IO)

This plan details the implementation of **Phase 13 (Real-time chat/prompt streaming via Server-Sent Events and live event broadcasting via Socket.IO)** for the Agent Builder backend.

---

## User Review Required

> [!IMPORTANT]
> - **SSE Streaming**: Prompt Studio output streams token-by-token over `text/event-stream` (chat streaming already existed for chat sessions).
> - **Socket.IO**: Authenticated real-time server broadcasting `chat:message`, `training:updated`, `billing:updated`, and `notification:new` events to per-user and per-workspace rooms.
> - **Decoupled Broadcaster**: Services emit events through an `EventEmitter` facade; the Socket.IO adapter forwards to clients. When no adapter is attached, emits are no-ops (test-safe).

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Real-Time Broadcast Facade (`server/src/realtime/index.ts`)
- `RealtimeService` with `emitToWorkspace(workspaceId, event, payload)` and `emitToUser(userId, event, payload)`.
- `subscribe(handler)` returns an unsubscribe function used by the Socket.IO adapter.

### 2. Socket.IO Server (`server/src/realtime/socket.ts`)
- `initRealtime(httpServer)` attaches Socket.IO, authenticates via JWT `handshake.auth.token`.
- Joins `user:{userId}` room automatically; clients opt into `workspace:{workspaceId}` via `workspace:join` / `workspace:leave`.
- Bridges broadcaster events to the correct rooms.

### 3. Server Bootstrap (`server/src/server.ts`)
- Creates the HTTP server with `http.createServer(app)`, initializes Socket.IO, and closes it on graceful shutdown.

### 4. SSE Prompt Streaming
- `prompt.service.streamPromptExecution` emits simulated chunked output; `prompt.controller.streamPromptExecution` writes SSE frames ending with `[done]` metadata.
- Route: `GET /workspaces/:id/prompts/stream`.

### 5. Event Emissions in Services
- `chat.service.sendMessage` emits `chat:message` after the assistant reply is stored.
- `training.service.runTrainingSimulation` emits `training:updated` for in-progress and completed states.

### 6. Tests (`server/tests/realtime.test.ts`)
- Broadcast facade delivery + unsubscribe behavior.
- SSE prompt stream returns `text/event-stream` with chunk + done frames.

---

## Verification Plan

### Automated Tests
1. Execute Jest test suite: `npm test` verifying real-time facade and SSE streaming.
2. Verify `npm run build` compiles clean.

### Manual Verification
- Start server, connect a Socket.IO client with a JWT, join a workspace room, and confirm `chat:message` events arrive after a chat message is posted.
- Open the Prompt Studio SSE endpoint and observe streamed chunks.
