import type { PromptTemplate } from "@/modules/ai/types";

export interface SkillGapAnalyzeInput {
  resumeSkills: string[];
  jobKeywords: string[];
}

export function buildSkillGapAnalyzePrompt(
  input: SkillGapAnalyzeInput,
): PromptTemplate {
  return {
    systemPrompt:
      "You analyze resume skill gaps against job keywords. Output valid JSON only.",
    userPrompt: [
      "Perform a skill gap analysis.",
      `Resume skills: ${input.resumeSkills.join(", ")}`,
      `Job keywords: ${input.jobKeywords.join(", ")}`,
      "Return JSON with: missingSkills, missingKeywords, levelMismatch, recommendations",
    ].join("\n"),
    maxTokens: 450,
    temperature: 0.3,
  };
}
