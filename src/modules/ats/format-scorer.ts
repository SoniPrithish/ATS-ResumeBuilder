/**
 * @module modules/ats/format-scorer
 * @description Scores resume format compatibility with ATS parsers.
 * Checks file type, column layout, special characters, contact info, and whitespace.
 */

import type { CategoryScore } from "@/types/ats";
import type { FormatInput } from "./types";

/**
 * Score a resume's format for ATS compatibility.
 * Starts at 100 and deducts for common formatting issues.
 *
 * @param input - Format scoring input
 * @returns CategoryScore with format analysis
 */
export function scoreFormat(input: FormatInput): CategoryScore {
    let score = 100;
    const details: string[] = [];

    // 1. File type check (-20 if not pdf/docx)
    if (input.fileType === "pdf") {
        details.push("✅ PDF format (ATS-preferred)");
    } else if (input.fileType === "docx") {
        details.push("✅ DOCX format (ATS-compatible)");
    } else {
        score -= 20;
        details.push("⚠️ Unknown file format — use PDF or DOCX for best ATS compatibility");
    }

    // 2. Multi-column detection (-15)
    const lines = input.rawText.split("\n");
    const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
    if (nonEmptyLines.length > 0) {
        const shortLineCount = nonEmptyLines.filter((l) => l.trim().length < 15).length;
        const ratio = shortLineCount / nonEmptyLines.length;
        if (ratio > 0.4) {
            score -= 15;
            details.push(
                "⚠️ Possible multi-column layout detected — may confuse ATS parsers"
            );
        } else {
            details.push("✅ Single-column layout detected");
        }
    }

    // 3. Special characters (-10)
    const specialCharRegex =
        /[│┃┆║═╔╗╚╝╠╣╦╩╬▪▫►◄●○■□★☆♦♣♠♥]/g;
    const specialMatches = input.rawText.match(specialCharRegex);
    const specialCount = specialMatches ? specialMatches.length : 0;
    if (specialCount > 5) {
        score -= 10;
        details.push(
            `⚠️ Contains ${specialCount} ATS-unfriendly special characters`
        );
    } else {
        details.push("✅ No problematic special characters");
    }

    // 4. Contact info at top (-10 if missing)
    if (input.hasContactInfo) {
        details.push("✅ Contact information found");
    } else {
        score -= 10;
        details.push("❌ No contact info detected at top");
    }

    // 5. Excessive blank lines (-5)
    if (lines.length > 0) {
        const blankLineCount = lines.filter((l) => l.trim().length === 0).length;
        const blankRatio = blankLineCount / lines.length;
        if (blankRatio > 0.2) {
            score -= 5;
            details.push("⚠️ Excessive whitespace — tighten up formatting");
        } else {
            details.push("✅ Appropriate whitespace usage");
        }
    }

    score = Math.max(0, Math.min(100, score));

    return {
        category: "format",
        score,
        maxScore: 100,
        feedback:
            score >= 90
                ? "Great formatting — your resume is ATS-optimized."
                : score >= 70
                    ? "Good formatting with a few areas to improve."
                    : "Formatting issues detected — ATS parsers may struggle with this resume.",
        suggestions: details.filter((d) => d.startsWith("⚠️") || d.startsWith("❌")),
    };
}
