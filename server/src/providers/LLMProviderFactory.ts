import { ILLMProvider } from "./ILLMProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OllamaProvider } from "./OllamaProvider";
import { ProviderType } from "@prisma/client";
import { LLMCompletionOptions, LLMCompletionResponse } from "../interfaces/llm.interface";
import { logger } from "../utils/logger";

export class LLMProviderFactory {
  static getProvider(type: ProviderType, apiKey?: string, baseUrl?: string): ILLMProvider {
    switch (type) {
      case ProviderType.OPENAI:
        return new OpenAIProvider(apiKey, baseUrl);
      case ProviderType.ANTHROPIC:
        return new AnthropicProvider(apiKey);
      case ProviderType.GEMINI:
        return new GeminiProvider(apiKey);
      case ProviderType.OLLAMA:
        return new OllamaProvider(baseUrl);
      default:
        return new OpenAIProvider(apiKey, baseUrl);
    }
  }

  /**
   * Executes completion across primary provider with fallback chain and exponential backoff retries
   */
  static async executeWithFallback(
    providers: Array<{ type: ProviderType; apiKey?: string; baseUrl?: string }>,
    options: LLMCompletionOptions,
    maxRetries = 2
  ): Promise<LLMCompletionResponse> {
    const chain = providers.length > 0 ? providers : [{ type: ProviderType.OPENAI }, { type: ProviderType.OLLAMA }];

    for (const pConfig of chain) {
      const provider = this.getProvider(pConfig.type, pConfig.apiKey, pConfig.baseUrl);

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await provider.generateCompletion(options);
        } catch (error) {
          logger.warn(
            `LLM call failed on [${pConfig.type}] attempt ${attempt}/${maxRetries}: ${(error as Error).message}`
          );
          if (attempt < maxRetries) {
            // Exponential backoff wait (200ms, 400ms...)
            await new Promise((resolve) => setTimeout(resolve, attempt * 200));
          }
        }
      }

      logger.warn(`Provider [${pConfig.type}] exhausted retries. Falling back to next provider in chain.`);
    }

    // Ultimate fallback if all configured providers fail
    const ultimateFallback = new OllamaProvider();
    return ultimateFallback.generateCompletion(options);
  }
}
