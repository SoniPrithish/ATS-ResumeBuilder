import type { PromptTemplate } from "@/modules/ai/types";

export interface JDParseInput {
  rawText: string;
}

export function buildJDParsePrompt(input: JDParseInput): PromptTemplate {
  return {
    systemPrompt:
      "You parse job descriptions into structured JSON for matching systems.",
    userPrompt: [
      "Parse this job description.",
      input.rawText,
      "Return JSON with: title, company, location, type, level, requirements, responsibilities, keywords",
    ].join("\n"),
    maxTokens: 700,
    temperature: 0.2,
  };
}
