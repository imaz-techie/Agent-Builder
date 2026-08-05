# Implementation Plan - Phase 8: LLM Provider Abstraction Layer

This plan details the implementation of **Phase 8 (Universal LLM Provider Abstraction Layer, OpenAI, Anthropic, Gemini, Azure OpenAI, OpenRouter, Ollama, Server-Sent Events (SSE) Streaming, Fallback Strategy, Retry Logic, and Rate Limiting)** for the Agent Builder backend using Clean Architecture.

---

## User Review Required

> [!IMPORTANT]
> - **Universal Provider Interface (`ILLMProvider`)**: Strategy pattern interface supporting `generateCompletion` and `streamCompletion` across all providers.
> - **Supported LLM Providers**:
>   - **OpenAI**: GPT-4o, GPT-4o Mini
>   - **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
>   - **Google Gemini**: Gemini 1.5 Pro
>   - **Azure OpenAI**, **OpenRouter**, **Ollama** (Local LLM endpoint)
> - **Fallback & Retry Logic**: Automatic fallback provider sequence (e.g., OpenAI → Anthropic → Ollama) if a provider API fails or rate limits.
> - **Server-Sent Events (SSE) Streaming**: Dedicated `/stream` endpoints streaming chunks in real-time to the client.
> - **Prisma Model**: `LlmProviderConfig` for storing workspace API keys (encrypted/masked) and provider priority settings.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add model:
- `LlmProviderConfig`: `id`, `provider` (enum `OPENAI`, `ANTHROPIC`, `GEMINI`, `AZURE_OPENAI`, `OPENROUTER`, `OLLAMA`), `apiKeyMasked`, `apiKeyEncrypted`, `baseUrl`, `isDefault`, `isEnabled`, `priority`, `workspaceId`, `createdById`, timestamps.

### 2. Provider Abstraction Layer (`server/src/providers/`)
Create provider strategy implementations:
- `ILLMProvider.ts`: Interface defining `generateCompletion(options)` and `streamCompletion(options, onChunk)`.
- `OpenAIProvider.ts`: Implementation for OpenAI API.
- `AnthropicProvider.ts`: Implementation for Anthropic Messages API.
- `GeminiProvider.ts`: Implementation for Google Gemini API.
- `OllamaProvider.ts`: Implementation for Ollama Local API.
- `LLMProviderFactory.ts`: Factory with fallback chain & exponential backoff retry handler.

### 3. DTOs & Interfaces (`server/src/interfaces/llm.interface.ts`)
- `LLMCompletionRequest`, `LLMCompletionResponse`, `LLMStreamChunk`, `ProviderConfigDTO`, `ConfigureProviderDTO`.

### 4. Validation Schemas (`server/src/validators/llm.validator.ts`)
Zod validation schemas for:
- `completionRequestSchema`, `configureProviderSchema`.

### 5. Repository Layer (`server/src/repositories/llmProvider.repository.ts`)
Database access methods:
- `saveProviderConfig`, `findConfigsByWorkspace`, `findActiveProvidersOrderedByPriority`, `deleteProviderConfig`.

### 6. Service Layer (`server/src/services/llm.service.ts`)
Business logic:
- `generateCompletion`: Call primary provider or fallback chain with retry logic.
- `streamCompletion`: SSE chunk streaming pipeline.
- `configureProvider`: Save & encrypt provider credentials.
- `testProviderConnection`: Health ping check for configured API keys.

### 7. Controller & Routes (`server/src/controllers/llm.controller.ts` & `server/src/routes/llm.routes.ts`)
REST & Streaming Endpoints:
- `POST /api/v1/workspaces/:workspaceId/llm/completion` -> Non-streaming completion
- `GET /api/v1/workspaces/:workspaceId/llm/stream` -> Server-Sent Events (SSE) streaming completion
- `POST /api/v1/workspaces/:workspaceId/llm/providers` -> Configure provider credentials
- `GET /api/v1/workspaces/:workspaceId/llm/providers` -> List configured providers
- `POST /api/v1/workspaces/:workspaceId/llm/providers/:id/test` -> Test provider connection

### 8. Tests (`server/tests/llm.test.ts`)
Unit & integration tests for LLM provider abstraction, fallback strategy, retry mechanism, and SSE response streaming.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/llm/completion`, fallback chain, provider configs, and SSE stream endpoints.
3. Verify `npm run build` compiles clean.

### Manual Verification
- Test sending completion requests, verifying fallback behavior when a provider is disabled, and inspecting SSE streamed response chunks.
