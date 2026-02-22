import { describe, it, expect } from "vitest";
import { calculateSimilarity } from "@/modules/matcher/similarity-engine";

describe("similarity-engine", () => {
    it("returns near 1.0 for identical text", () => {
        const text = "python react aws docker";
        const result = calculateSimilarity(text, text);
        expect(result.cosineSimilarity).toBeCloseTo(1, 5);
    });

    it("returns near 0 for different texts", () => {
        const result = calculateSimilarity("golang kubernetes", "photoshop figma branding");
        expect(result.cosineSimilarity).toBeLessThan(0.1);
    });

    it("returns mid similarity for partial overlap", () => {
        const result = calculateSimilarity("python react postgres", "python aws docker");
        expect(result.cosineSimilarity).toBeGreaterThanOrEqual(0);
        expect(result.cosineSimilarity).toBeLessThan(1);
    });

    it("handles empty input", () => {
        const result = calculateSimilarity("", "python");
        expect(result.cosineSimilarity).toBe(0);
    });

    it("handles single word docs", () => {
        const result = calculateSimilarity("python", "python");
        expect(result.cosineSimilarity).toBeCloseTo(1, 5);
    });

    it("includes shared terms", () => {
        const result = calculateSimilarity("python react", "python aws");
        expect(result.topSharedTerms).toContain("python");
    });

    it("identifies JD-specific terms", () => {
        const result = calculateSimilarity("python react", "python aws terraform");
        expect(result.uniqueToJD).toEqual(expect.arrayContaining(["aws", "terraform"]));
    });
});
