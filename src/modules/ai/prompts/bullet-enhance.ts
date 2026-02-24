import type { PromptTemplate } from "@/modules/ai/types";

export interface BulletEnhanceInput {
  bullet: string;
  role?: string;
}

export function buildBulletEnhancePrompt(input: BulletEnhanceInput): PromptTemplate {
  return {
    systemPrompt:
      "You improve resume bullets. Preserve factual accuracy and output valid JSON only.",
    userPrompt: [
      "Enhance this resume bullet for ATS impact.",
      input.role ? `Target role: ${input.role}` : "",
      `Bullet: ${input.bullet}`,
      "Return JSON with: original, enhanced, explanation",
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 256,
    temperature: 0.4,
  };
}
