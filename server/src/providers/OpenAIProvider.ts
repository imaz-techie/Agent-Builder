import { ILLMProvider } from "./ILLMProvider";
import { ProviderType } from "@prisma/client";
import { LLMCompletionOptions, LLMCompletionResponse } from "../interfaces/llm.interface";

export class OpenAIProvider implements ILLMProvider {
  readonly providerType = ProviderType.OPENAI;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey = process.env.OPENAI_API_KEY || "sk-dummy-openai-key", baseUrl = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateCompletion(options: LLMCompletionOptions): Promise<LLMCompletionResponse> {
    const startTime = Date.now();
    const content = `[OpenAI ${options.model} Response]\n${options.userPrompt}\n\nProcessed with system instruction: "${options.systemPrompt || "Default Assistant"}"`;
    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 200) + 150;
    const tokensUsed = Math.ceil((options.userPrompt.length + content.length) / 4);

    return {
      provider: this.providerType,
      model: options.model,
      content,
      tokensUsed,
      latencyMs,
    };
  }

  async streamCompletion(
    options: LLMCompletionOptions,
    onChunk: (chunk: string) => void
  ): Promise<LLMCompletionResponse> {
    const response = await this.generateCompletion(options);
    const words = response.content.split(" ");

    for (const word of words) {
      onChunk(word + " ");
    }

    return response;
  }

  async testConnection(): Promise<boolean> {
    return !!this.apiKey;
  }
}
