import { describe, expect, it } from "vitest";
import {
  checkBudget,
  estimateTokens,
  selectOptimalModel,
} from "@/modules/ai/token-budgeter";

describe("token-budgeter", () => {
  it("estimates tokens using 4-char heuristic", () => {
    expect(estimateTokens("1234")).toBe(1);
    expect(estimateTokens("12345")).toBe(2);
  });

  it("returns in-budget result", () => {
    const result = checkBudget(400, 200, 800);
    expect(result.withinBudget).toBe(true);
    expect(result.estimatedTotal).toBe(600);
  });

  it("returns over-budget recommendation", () => {
    const result = checkBudget(700, 300, 900);
    expect(result.withinBudget).toBe(false);
    expect(result.recommendation).toContain("Reduce prompt");
  });

  it("selects a model by quality", () => {
    expect(selectOptimalModel(2000, "fast")).toBe("llama-3.1-8b-instant");
    expect(selectOptimalModel(2000, "high")).toBe("gemini-1.5-flash");
  });
});
