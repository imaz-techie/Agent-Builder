import OpenAI from "openai";
import { ILLMProvider } from "./ILLMProvider";
import { ProviderType, LlmModel } from "@prisma/client";
import { LLMCompletionOptions, LLMCompletionResponse } from "../interfaces/llm.interface";

// Map Prisma LlmModel enum → OpenRouter model strings (free tier preferred)
const MODEL_MAP: Record<string, string> = {
  GPT_4O: "meta-llama/llama-3.1-8b-instruct:free",
  GPT_4O_MINI: "meta-llama/llama-3.1-8b-instruct:free",
  CLAUDE_3_5_SONNET: "meta-llama/llama-3.1-8b-instruct:free",
  CLAUDE_3_HAIKU: "meta-llama/llama-3.1-8b-instruct:free",
  GEMINI_1_5_PRO: "meta-llama/llama-3.1-8b-instruct:free",
  LLAMA_3_1_70B: "meta-llama/llama-3.1-70b-instruct:free",
};

export class OpenRouterProvider implements ILLMProvider {
  readonly providerType = ProviderType.OPENROUTER;
  private client: OpenAI;

  constructor(
    apiKey = process.env.OPENROUTER_API_KEY || "",
    baseUrl = "https://openrouter.ai/api/v1"
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      defaultHeaders: {
        "HTTP-Referer": "https://agentbuilder.app",
        "X-Title": "Agent Builder",
      },
    });
  }

  private buildMessages(options: LLMCompletionOptions): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.userPrompt });
    return messages;
  }

  async generateCompletion(options: LLMCompletionOptions): Promise<LLMCompletionResponse> {
    const startTime = Date.now();
    const model = MODEL_MAP[options.model] || "meta-llama/llama-3.1-8b-instruct:free";

    const response = await this.client.chat.completions.create({
      model,
      messages: this.buildMessages(options),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      stop: options.stopSequences,
    });

    const content = response.choices[0]?.message?.content || "";
    const tokensUsed = response.usage?.total_tokens || Math.ceil(content.length / 4);

    return {
      provider: this.providerType,
      model: options.model,
      content,
      tokensUsed,
      latencyMs: Date.now() - startTime,
    };
  }

  async streamCompletion(
    options: LLMCompletionOptions,
    onChunk: (chunk: string) => void
  ): Promise<LLMCompletionResponse> {
    const startTime = Date.now();
    const model = MODEL_MAP[options.model] || "meta-llama/llama-3.1-8b-instruct:free";

    const stream = await this.client.chat.completions.create({
      model,
      messages: this.buildMessages(options),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      stop: options.stopSequences,
      stream: true,
    });

    let fullContent = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullContent += delta;
        onChunk(delta);
      }
    }

    return {
      provider: this.providerType,
      model: options.model,
      content: fullContent,
      tokensUsed: Math.ceil(fullContent.length / 4),
      latencyMs: Date.now() - startTime,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
