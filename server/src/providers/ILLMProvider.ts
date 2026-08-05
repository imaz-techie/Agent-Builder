import { ProviderType } from "@prisma/client";
import { LLMCompletionOptions, LLMCompletionResponse } from "../interfaces/llm.interface";

export interface ILLMProvider {
  readonly providerType: ProviderType;

  /**
   * Generates a single completion response synchronously
   */
  generateCompletion(options: LLMCompletionOptions): Promise<LLMCompletionResponse>;

  /**
   * Streams completion tokens via callback handler
   */
  streamCompletion(
    options: LLMCompletionOptions,
    onChunk: (chunk: string) => void
  ): Promise<LLMCompletionResponse>;

  /**
   * Health ping connection test
   */
  testConnection(): Promise<boolean>;
}
