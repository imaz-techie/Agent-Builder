import { ILLMProvider } from "./ILLMProvider";
import { ProviderType } from "@prisma/client";
import { LLMCompletionOptions, LLMCompletionResponse } from "../interfaces/llm.interface";

export class GeminiProvider implements ILLMProvider {
  readonly providerType = ProviderType.GEMINI;
  private apiKey: string;

  constructor(apiKey = process.env.GEMINI_API_KEY || "AIzaSy-dummy-gemini-key") {
    this.apiKey = apiKey;
  }

  async generateCompletion(options: LLMCompletionOptions): Promise<LLMCompletionResponse> {
    const startTime = Date.now();
    const content = `[Google Gemini 1.5 Pro Output]\nGemini intelligent response for: "${options.userPrompt}"`;
    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 180) + 140;
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
