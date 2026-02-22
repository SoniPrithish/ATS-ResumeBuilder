/**
 * @module tests/unit/ats/readability-scorer.test
 * @description Tests for the ATS readability scorer.
 */

import { describe, it, expect } from "vitest";
import { scoreReadability } from "@/modules/ats/readability-scorer";
import type { ReadabilityInput } from "@/modules/ats/types";

describe("scoreReadability", () => {
    it("should score an ideal length resume highly", () => {
        // ~500 words
        const words = Array.from(
            { length: 500 },
            (_, i) => `word${i}`
        );
        const input: ReadabilityInput = {
            rawText: words.join(" "),
            bulletCount: 15,
        };

        const result = scoreReadability(input);
        expect(result.score).toBeGreaterThanOrEqual(85);
        expect(result.category).toBe("readability");
    });

    it("should deduct for too short resume", () => {
        const input: ReadabilityInput = {
            rawText: "Just a few words here in this resume that is way too short",
            bulletCount: 0,
        };

        const result = scoreReadability(input);
        expect(result.score).toBeLessThanOrEqual(90);
        expect(result.suggestions.some((s) => s.includes("too short"))).toBe(true);
    });

    it("should deduct for too long resume", () => {
        const words = Array.from({ length: 2000 }, (_, i) => `word${i}`);
        const input: ReadabilityInput = {
            rawText: words.join(" "),
            bulletCount: 20,
        };

        const result = scoreReadability(input);
        expect(result.score).toBeLessThanOrEqual(95);
        expect(result.suggestions.some((s) => s.includes("too long"))).toBe(true);
    });

    it("should deduct for repetitive verbs", () => {
        // Repeat "developed" > 3 times
        const lines = [
            "Developed a microservices architecture",
            "Developed a REST API",
            "Developed a CI/CD pipeline",
            "Developed a monitoring dashboard",
            "Developed a testing framework",
        ];
        // Pad with more unique words to reach proper length
        const padding = Array.from({ length: 300 }, (_, i) => `unique${i}`);
        const input: ReadabilityInput = {
            rawText: [...lines, ...padding].join("\n"),
            bulletCount: 5,
        };

        const result = scoreReadability(input);
        expect(result.suggestions.some((s) => s.toLowerCase().includes("repetitive") || s.toLowerCase().includes("developed"))).toBe(
            true
        );
    });

    it("should score a clean resume ~95-100", () => {
        // Well-structured resume with good variety
        const sections = [
            "Jane Doe",
            "jane@example.com",
            "",
            "Summary: Senior Software Engineer with 5 years of experience.",
            "",
            "Experience:",
            "• Led development of microservices architecture",
            "• Reduced API latency by implementing caching",
            "• Mentored junior engineers across teams",
            "• Designed scalable data pipelines",
            "• Built automated testing frameworks",
            "",
            "Education:",
            "B.S. Computer Science, Stanford University",
            "",
            "Skills: TypeScript, Python, React, Node.js, PostgreSQL, Docker",
        ];
        // Pad to reach reasonable word count
        const padding = Array.from(
            { length: 250 },
            (_, i) => `context${i}`
        );
        const input: ReadabilityInput = {
            rawText: [...sections, ...padding].join("\n"),
            bulletCount: 5,
        };

        const result = scoreReadability(input);
        expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it("should deduct for high acronym density", () => {
        // Generate 20 unique 3+ letter uppercase acronyms 
        const acronyms = [
            "ABC", "DEF", "GHI", "JKL", "MNO",
            "PQR", "STU", "VWX", "YZA", "BCD",
            "EFG", "HIJ", "KLM", "NOP", "QRS",
            "TUV", "WXY", "ZAB", "CDE", "FGH",
        ];
        const padding = Array.from({ length: 400 }, (_, i) => `word${i}`);
        const input: ReadabilityInput = {
            rawText: [...acronyms, ...padding].join(" "),
            bulletCount: 5,
        };

        const result = scoreReadability(input);
        expect(result.suggestions.some((s) => s.includes("acronym"))).toBe(true);
    });

    it("should deduct for large text blocks", () => {
        // A paragraph with > 100 words
        const bigBlock = Array.from({ length: 120 }, (_, i) => `word${i}`).join(
            " "
        );
        const padding = Array.from({ length: 200 }, (_, i) => `padding${i}`);
        const input: ReadabilityInput = {
            rawText: bigBlock + "\n\n" + padding.join(" "),
            bulletCount: 0,
        };

        const result = scoreReadability(input);
        expect(result.suggestions.some((s) => s.includes("block") || s.includes("bullet"))).toBe(
            true
        );
    });
});
