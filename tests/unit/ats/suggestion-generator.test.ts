/**
 * @module tests/unit/ats/suggestion-generator.test
 * @description Tests for the ATS suggestion generator.
 */

import { describe, it, expect } from "vitest";
import { generateSuggestions } from "@/modules/ats/suggestion-generator";
import type { ATSBreakdown, CategoryScore } from "@/types/ats";

function makeScore(
    category: string,
    score: number,
    suggestions: string[] = []
): CategoryScore {
    return {
        category,
        score,
        maxScore: 100,
        feedback: `Score: ${score}`,
        suggestions,
    };
}

function makeBreakdown(overrides: Partial<Record<string, CategoryScore>> = {}): ATSBreakdown {
    return {
        keywords: makeScore("keywords", 80),
        formatting: makeScore("formatting", 80),
        experience: makeScore("experience", 80),
        education: makeScore("education", 80),
        skills: makeScore("skills", 80),
        format: makeScore("format", 80),
        sections: makeScore("sections", 80),
        bullets: makeScore("bullets", 80),
        readability: makeScore("readability", 80),
        ...overrides,
    };
}

describe("generateSuggestions", () => {
    it("should generate critical format suggestion for low score", () => {
        const breakdown = makeBreakdown({
            format: makeScore("format", 30, [
                "⚠️ Possible multi-column layout detected",
                "⚠️ Contains special characters",
            ]),
        });

        const suggestions = generateSuggestions(breakdown);
        const formatSuggestion = suggestions.find((s) => s.category === "format");
        expect(formatSuggestion).toBeDefined();
        expect(formatSuggestion!.priority).toBe("high");
        expect(formatSuggestion!.message).toBeTruthy();
    });

    it("should generate critical bullet suggestion for low score", () => {
        const breakdown = makeBreakdown({
            bullets: makeScore("bullets", 25, [
                "⚠️ Weak verbs detected",
            ]),
        });

        const suggestions = generateSuggestions(breakdown);
        const bulletSuggestion = suggestions.find((s) => s.category === "bullets");
        expect(bulletSuggestion).toBeDefined();
        expect(bulletSuggestion!.priority).toBe("high");
        expect(bulletSuggestion!.message).toContain("action verb");
    });

    it("should return empty array when all scores are >= 90", () => {
        const breakdown = makeBreakdown({
            format: makeScore("format", 95),
            keywords: makeScore("keywords", 92),
            sections: makeScore("sections", 98),
            bullets: makeScore("bullets", 90),
            readability: makeScore("readability", 91),
        });

        const suggestions = generateSuggestions(breakdown);
        expect(suggestions.length).toBe(0);
    });

    it("should assign correct severity based on score ranges", () => {
        const breakdown = makeBreakdown({
            format: makeScore("format", 30),         // critical
            keywords: makeScore("keywords", 55),     // warning
            sections: makeScore("sections", 75),     // info
            bullets: makeScore("bullets", 95),       // no suggestion
            readability: makeScore("readability", 95), // no suggestion
        });

        const suggestions = generateSuggestions(breakdown);

        const formatSug = suggestions.find((s) => s.category === "format");
        const keywordSug = suggestions.find((s) => s.category === "keywords");
        const sectionSug = suggestions.find((s) => s.category === "sections");
        const bulletSug = suggestions.find((s) => s.category === "bullets");

        expect(formatSug?.priority).toBe("high");
        expect(keywordSug?.priority).toBe("medium");
        expect(sectionSug?.priority).toBe("low");
        expect(bulletSug).toBeUndefined();
    });

    it("should sort suggestions: critical first, then warning, then info", () => {
        const breakdown = makeBreakdown({
            format: makeScore("format", 75),         // info
            keywords: makeScore("keywords", 30),     // critical
            sections: makeScore("sections", 55),     // warning
            bullets: makeScore("bullets", 35),       // critical
            readability: makeScore("readability", 80), // info
        });

        const suggestions = generateSuggestions(breakdown);

        // Verify ordering
        for (let i = 1; i < suggestions.length; i++) {
            const prevOrder = { high: 0, medium: 1, low: 2 }[suggestions[i - 1].priority];
            const currOrder = { high: 0, medium: 1, low: 2 }[suggestions[i].priority];
            expect(prevOrder).toBeLessThanOrEqual(currOrder);
        }
    });

    it("should generate actionable messages containing specific advice", () => {
        const breakdown = makeBreakdown({
            keywords: makeScore("keywords", 45, [
                "❌ Missing keywords: Docker, Kubernetes",
            ]),
        });

        const suggestions = generateSuggestions(breakdown);
        const keywordSug = suggestions.find((s) => s.category === "keywords");
        expect(keywordSug).toBeDefined();
        expect(keywordSug!.message.length).toBeGreaterThan(20);
    });
});
