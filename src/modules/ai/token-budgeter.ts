import type { BudgetResult, ModelLimits } from "@/modules/ai/types";

const DEFAULT_MODEL_LIMITS: ModelLimits = {
  inputLimit: 128_000,
  outputLimit: 4_096,
  requestsPerMinute: 60,
  costPer1kTokens: 0,
};

const MODEL_LIMITS: Record<string, ModelLimits> = {
  "gemini-1.5-flash": {
    inputLimit: 1_000_000,
    outputLimit: 8_192,
    requestsPerMinute: 60,
    costPer1kTokens: 0.00035,
  },
  "llama-3.1-8b-instant": {
    inputLimit: 128_000,
    outputLimit: 4_096,
    requestsPerMinute: 120,
    costPer1kTokens: 0.00005,
  },
  "mock-model": {
    inputLimit: 1_000_000,
    outputLimit: 8_192,
    requestsPerMinute: 1_000,
    costPer1kTokens: 0,
  },
};

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 4);
}

export function checkBudget(
  inputTokens: number,
  maxOutput: number,
  limit: number,
): BudgetResult {
  const estimatedTotal = inputTokens + maxOutput;
  const withinBudget = estimatedTotal <= limit;

  return {
    withinBudget,
    estimatedInputTokens: inputTokens,
    maxOutputTokens: maxOutput,
    estimatedTotal,
    limit,
    recommendation: withinBudget
      ? "Within budget"
      : `Reduce prompt by ~${estimatedTotal - limit} tokens or lower max output`,
  };
}

export function selectOptimalModel(
  inputSize: number,
  quality: "fast" | "balanced" | "high" = "balanced",
): string {
  if (quality === "high") return "gemini-1.5-flash";
  if (quality === "fast") {
    return inputSize > 6_000 ? "gemini-1.5-flash" : "llama-3.1-8b-instant";
  }
  return inputSize > 16_000 ? "gemini-1.5-flash" : "llama-3.1-8b-instant";
}

export function getModelLimits(model: string): ModelLimits {
  return MODEL_LIMITS[model] ?? DEFAULT_MODEL_LIMITS;
}
