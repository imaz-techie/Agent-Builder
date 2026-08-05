import { ILLMProvider } from "./ILLMProvider";
import { ProviderType } from "@prisma/client";
import { LLMCompletionOptions, LLMCompletionResponse } from "../interfaces/llm.interface";

export class OllamaProvider implements ILLMProvider {
  readonly providerType = ProviderType.OLLAMA;
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:11434") {
    this.baseUrl = baseUrl;
  }

  async generateCompletion(options: LLMCompletionOptions): Promise<LLMCompletionResponse> {
    const startTime = Date.now();
    const content = `[Local Ollama ${options.model}]\nOff-line generated response for prompt: "${options.userPrompt}"`;
    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 150) + 100;
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
    return true;
  }
}
