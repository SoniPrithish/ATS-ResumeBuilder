import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseAIResponse } from "@/modules/ai/response-parser";

describe("response-parser", () => {
  const schema = z.object({ summary: z.string() });

  it("parses plain JSON", () => {
    const result = parseAIResponse('{"summary":"ok"}', schema);
    expect(result.success).toBe(true);
    expect(result.data?.summary).toBe("ok");
  });

  it("parses fenced JSON blocks", () => {
    const result = parseAIResponse("```json\n{\"summary\":\"from-block\"}\n```", schema);
    expect(result.success).toBe(true);
    expect(result.data?.summary).toBe("from-block");
  });

  it("returns failure on invalid JSON", () => {
    const result = parseAIResponse("not-json", schema);
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
  });

  it("returns failure on schema mismatch", () => {
    const result = parseAIResponse('{"wrong":true}', schema);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
