import type { PromptTemplate } from "@/modules/ai/types";

export interface ResumeTailorInput {
  summary: string;
  bullets: string[];
  jobDescription: string;
}

export function buildResumeTailorPrompt(input: ResumeTailorInput): PromptTemplate {
  return {
    systemPrompt:
      "You tailor resumes to job descriptions while keeping details truthful. Output valid JSON only.",
    userPrompt: [
      "Tailor this resume to the target job description.",
      `Summary: ${input.summary}`,
      `Experience highlights: ${input.bullets.join(" | ")}`,
      `Job Description: ${input.jobDescription}`,
      "Return JSON with: tailoredSummary, bulletSuggestions[{original,tailored,reasoning}], skillsToHighlight, keywordsToAdd",
    ].join("\n"),
    maxTokens: 1_200,
    temperature: 0.4,
  };
}
