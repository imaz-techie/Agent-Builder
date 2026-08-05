# Implementation Plan - Phase 10: Chat & Agent Execution Runtime

This plan details the implementation of **Phase 10 (Agent Execution Engine, Prompt Assembly Engine, Conversation Sessions, Chat Messages, SSE Response Streaming, RAG Context Injection, and Token/Latency Metrics)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Prisma Schema Expansion**: Adding `ConversationSession` and `ChatMessage` models to `server/prisma/schema.prisma`.
> - **Prompt Assembly Engine**: Assembling Agent System Prompt + RAG Retrived Context + Conversation History + User Query into a unified execution prompt.
> - **Real-Time Streaming (`/chat/stream`)**: Server-Sent Events (SSE) streaming of agent chat tokens directly to the React frontend.
> - **Citation & Metric Tracking**: Attaching document citations, latency MS, and token usage to every `ChatMessage`.
> - **Frontend Integration**: Aligns directly with [AgentChatPage.tsx](file:///d:/Imaz/Imaz%20Projects/Agent%20Builder/src/pages/AgentChatPage.tsx) so agents can be tested and chatted with interactively when `VITE_USE_API=true`.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add models:
- `ConversationSession`: `id`, `agentId`, `title`, `metadata` (JSON), `workspaceId`, `createdById`, timestamps.
- `ChatMessage`: `id`, `sessionId`, `role` (enum `USER`, `ASSISTANT`, `SYSTEM`), `content`, `tokensCount`, `latencyMs`, `citations` (JSON array), `workspaceId`, `createdById`, timestamps.

### 2. DTOs & Interfaces (`server/src/interfaces/chat.interface.ts`)
- `CreateSessionDTO`, `SendChatMessageDTO`, `ChatMessageResponse`, `ConversationSessionResponse`.

### 3. Validation Schemas (`server/src/validators/chat.validator.ts`)
Zod validation schemas for:
- `createSessionSchema`, `sendMessageSchema`.

### 4. Repository Layer (`server/src/repositories/chat.repository.ts`)
Database access methods:
- `createSession`, `findSessionById`, `findSessionsByAgent`, `createMessage`, `findMessagesBySession`.

### 5. Service Layer (`server/src/services/chat.service.ts`)
Business logic:
- `assemblePrompt`: Combine System Prompt, RAG Context, and sliding conversation history.
- `sendMessage`: Non-streaming chat completion with prompt assembly, LLM execution, citation logging, and message persistence.
- `streamMessage`: SSE streaming chat completion.

### 6. Controller & Routes (`server/src/controllers/chat.controller.ts` & `server/src/routes/chat.routes.ts`)
REST & Streaming Endpoints:
- `POST /api/v1/workspaces/:workspaceId/chat/sessions` -> Create chat session
- `GET /api/v1/workspaces/:workspaceId/chat/sessions` -> List agent chat sessions
- `GET /api/v1/workspaces/:workspaceId/chat/sessions/:sessionId/messages` -> List session messages
- `POST /api/v1/workspaces/:workspaceId/chat/messages` -> Send chat message (non-streaming)
- `GET /api/v1/workspaces/:workspaceId/chat/stream` -> SSE streaming chat response

### 7. Tests (`server/tests/chat.test.ts`)
Unit & integration tests covering session management, prompt assembly, message history, SSE streaming, and citations.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/chat` session CRUD, prompt assembly, message sending, citations, and SSE streaming.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test creating a session, sending a chat message to an active agent, receiving streamed response tokens with RAG citations attached, and listing past chat history.
