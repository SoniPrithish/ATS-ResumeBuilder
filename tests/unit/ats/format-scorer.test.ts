/**
 * @module tests/unit/ats/format-scorer.test
 * @description Tests for the ATS format compatibility scorer.
 */

import { describe, it, expect } from "vitest";
import { scoreFormat } from "@/modules/ats/format-scorer";
import type { FormatInput } from "@/modules/ats/types";

describe("scoreFormat", () => {
    it("should score a clean PDF highly (95-100)", () => {
        const input: FormatInput = {
            fileType: "pdf",
            rawText: [
                "Jane Doe",
                "jane@example.com | 555-123-4567",
                "",
                "Senior Software Engineer with 5+ years of experience.",
                "",
                "Experience:",
                "  Software Engineer at TechCorp",
                "  - Led development of microservices architecture",
                "  - Reduced API latency by 40% through caching",
                "  - Mentored 5 junior engineers across 2 teams",
                "",
                "Education:",
                "  B.S. Computer Science, Stanford University",
            ].join("\n"),
            hasContactInfo: true,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeGreaterThanOrEqual(90);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.category).toBe("format");
        expect(result.maxScore).toBe(100);
    });

    it("should score a clean DOCX highly", () => {
        const input: FormatInput = {
            fileType: "docx",
            rawText: "Jane Doe\njane@example.com\n\nSenior Engineer with 5+ years exp.\n\nExperience\nTechCorp - Software Engineer\n- Built microservices serving 1M+ users",
            hasContactInfo: true,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it("should deduct for multi-column layout", () => {
        // Many short lines simulating a multi-column layout
        const shortLines = Array.from({ length: 30 }, (_, i) => `Col ${i}`);
        const normalLines = Array.from({ length: 10 }, () =>
            "A normal length line that has enough words to not be short"
        );

        const input: FormatInput = {
            fileType: "pdf",
            rawText: [...shortLines, ...normalLines].join("\n"),
            hasContactInfo: true,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeLessThanOrEqual(90);
        expect(result.suggestions.some((s) => s.includes("multi-column"))).toBe(true);
    });

    it("should deduct for special characters", () => {
        const input: FormatInput = {
            fileType: "pdf",
            rawText:
                "Jane Doe\njane@example.com\n★★★★★★ Senior Engineer\n●●●●●● Skills\n■■■ Experience\nNormal text line that is long enough\nAnother normal text line here",
            hasContactInfo: true,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeLessThanOrEqual(95);
        expect(result.suggestions.some((s) => s.includes("special characters"))).toBe(true);
    });

    it("should deduct for missing contact info", () => {
        const input: FormatInput = {
            fileType: "pdf",
            rawText: "Some resume text with enough content\nAnother line of content\nMore content here with good length",
            hasContactInfo: false,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeLessThanOrEqual(90);
        expect(result.suggestions.some((s) => s.includes("contact"))).toBe(true);
    });

    it("should deduct for null file type", () => {
        const input: FormatInput = {
            fileType: null,
            rawText: "Jane Doe\njane@example.com\nSenior Engineer resume text\nMore text here with decent length",
            hasContactInfo: true,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeLessThanOrEqual(85);
        expect(result.suggestions.some((s) => s.includes("file format") || s.includes("Unknown"))).toBe(true);
    });

    it("should deduct for excessive blank lines", () => {
        const lines = ["Jane Doe", "jane@example.com"];
        // Add excessive blank lines (> 20%)
        for (let i = 0; i < 20; i++) {
            lines.push("");
        }
        lines.push("Some content");
        lines.push("More content here");

        const input: FormatInput = {
            fileType: "pdf",
            rawText: lines.join("\n"),
            hasContactInfo: true,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeLessThanOrEqual(95);
    });

    it("should handle all issues combined with score >= 0", () => {
        const shortLines = Array.from({ length: 30 }, (_, i) => `C${i}`);
        const specialChars = "★●■□♦♣♠♥▪▫►◄";

        const input: FormatInput = {
            fileType: null,
            rawText: [...shortLines, specialChars, "", "", "", "", "", "", ""].join(
                "\n"
            ),
            hasContactInfo: false,
        };

        const result = scoreFormat(input);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.suggestions.length).toBeGreaterThan(0);
    });
});
