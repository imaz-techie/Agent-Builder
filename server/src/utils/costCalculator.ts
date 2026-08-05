import { LlmModel } from "@prisma/client";

export interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
}

export const MODEL_PRICING_RATES: Record<LlmModel, ModelPricing> = {
  [LlmModel.GPT_4O]: { inputPer1M: 5.0, outputPer1M: 15.0 },
  [LlmModel.GPT_4O_MINI]: { inputPer1M: 0.15, outputPer1M: 0.6 },
  [LlmModel.CLAUDE_3_5_SONNET]: { inputPer1M: 3.0, outputPer1M: 15.0 },
  [LlmModel.CLAUDE_3_HAIKU]: { inputPer1M: 0.25, outputPer1M: 1.25 },
  [LlmModel.GEMINI_1_5_PRO]: { inputPer1M: 3.5, outputPer1M: 10.5 },
  [LlmModel.LLAMA_3_1_70B]: { inputPer1M: 0.9, outputPer1M: 0.9 },
};

/**
 * Calculates estimated USD cost for token consumption
 */
export function calculateTokenCost(model: LlmModel, totalTokens: number): number {
  const pricing = MODEL_PRICING_RATES[model] || MODEL_PRICING_RATES[LlmModel.GPT_4O];
  // Estimated 60% input tokens, 40% output tokens ratio
  const inputTokens = totalTokens * 0.6;
  const outputTokens = totalTokens * 0.4;

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;

  const totalCost = inputCost + outputCost;
  return parseFloat(totalCost.toFixed(6));
}
