import { describe, it, expect } from "vitest";
import { classifySkill, levenshteinDistance, SKILL_SIMILARITY_MAP } from "@/modules/matcher/skill-classifier";

describe("skill-classifier", () => {
    it("returns exact match with confidence 1.0", () => {
        const result = classifySkill("python");
        expect(result.confidence).toBe(1);
        expect(result.category).not.toBe("other");
    });

    it("returns fuzzy match for typo", () => {
        const result = classifySkill("pytohn");
        expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("returns other for unknown skill", () => {
        const result = classifySkill("unknown-super-skill");
        expect(result.category).toBe("other");
        expect(result.confidence).toBe(0);
    });

    it("handles abbreviation mapping", () => {
        const result = classifySkill("js");
        expect(result.category).not.toBe("other");
    });

    it("calculates levenshtein distance correctly", () => {
        expect(levenshteinDistance("kitten", "sitting")).toBe(3);
        expect(levenshteinDistance("python", "python")).toBe(0);
    });

    it("has bidirectional relationships", () => {
        expect(SKILL_SIMILARITY_MAP.react).toContain("vue");
        expect(SKILL_SIMILARITY_MAP.vue).toContain("react");
    });
});
