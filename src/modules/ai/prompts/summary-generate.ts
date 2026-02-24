import type { PromptTemplate } from "@/modules/ai/types";

export interface SummaryGenerateInput {
  title?: string;
  experienceBullets?: string[];
  skills?: string[];
}

export function buildSummaryGeneratePrompt(
  input: SummaryGenerateInput,
): PromptTemplate {
  return {
    systemPrompt:
      "You write concise professional resume summaries. Output valid JSON only.",
    userPrompt: [
      "Generate a professional summary.",
      `Role: ${input.title ?? "Software Professional"}`,
      `Experience highlights: ${(input.experienceBullets ?? []).join(" | ")}`,
      `Skills: ${(input.skills ?? []).join(", ")}`,
      "Return JSON with: summary, alternatives",
    ].join("\n"),
    maxTokens: 320,
    temperature: 0.5,
  };
}
