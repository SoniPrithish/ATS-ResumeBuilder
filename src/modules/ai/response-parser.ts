import type { ZodSchema } from "zod";

export interface ParsedResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  rawText: string;
}

const JSON_BLOCK_REGEX = /```(?:json)?\s*([\s\S]*?)\s*```/i;

function extractCandidate(rawText: string): string {
  const trimmed = rawText.trim();
  const blockMatch = trimmed.match(JSON_BLOCK_REGEX);
  if (blockMatch?.[1]) {
    return blockMatch[1].trim();
  }
  return trimmed;
}

export function parseAIResponse<T>(
  rawText: string,
  schema: ZodSchema<T>,
): ParsedResponse<T> {
  try {
    const candidate = extractCandidate(rawText);
    const parsed = JSON.parse(candidate) as unknown;
    const validation = schema.safeParse(parsed);

    if (!validation.success) {
      return {
        success: false,
        data: null,
        rawText,
        error: validation.error.issues
          .map((issue) => issue.message)
          .join("; "),
      };
    }

    return {
      success: true,
      data: validation.data,
      rawText,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      rawText,
      error: error instanceof Error ? error.message : "Failed to parse AI response",
    };
  }
}
