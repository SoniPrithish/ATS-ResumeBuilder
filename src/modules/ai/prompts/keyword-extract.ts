import type { PromptTemplate } from "@/modules/ai/types";

export interface KeywordExtractInput {
  jobDescription: string;
}

export function buildKeywordExtractPrompt(
  input: KeywordExtractInput,
): PromptTemplate {
  return {
    systemPrompt:
      "You extract ATS-relevant keywords from job descriptions. Output valid JSON only.",
    userPrompt: [
      "Extract keywords from this job description.",
      input.jobDescription,
      "Return JSON with: hardSkills, softSkills, tools, certifications, levels, locations",
    ].join("\n"),
    maxTokens: 500,
    temperature: 0.2,
  };
}
