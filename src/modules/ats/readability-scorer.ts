/**
 * @module modules/ats/readability-scorer
 * @description Scores resume readability and structural quality.
 * Checks word count, repetitive verbs, acronym density, and text block size.
 */

import type { CategoryScore } from "@/types/ats";
import type { ReadabilityInput } from "./types";

/**
 * Score the readability of a resume.
 * Starts at 100 and deducts for issues.
 *
 * @param input - Readability scoring input
 * @returns CategoryScore with readability analysis
 */
export function scoreReadability(input: ReadabilityInput): CategoryScore {
    let score = 100;
    const details: string[] = [];

    const words = input.rawText.split(/\s+/).filter((w) => w.length > 0);
    const totalWords = words.length;

    // 1. Word count (-10 if too short, -5 if too long)
    if (totalWords < 200) {
        score -= 10;
        details.push(
            `⚠️ Resume too short (${totalWords} words) — aim for 300–800 words for a one-page resume`
        );
    } else if (totalWords > 1500) {
        score -= 5;
        details.push(
            `⚠️ Resume too long (${totalWords} words) — consider trimming to under 1200 words`
        );
    } else {
        details.push(`✅ Good length (${totalWords} words)`);
    }

    // 2. Repetitive verbs (-5)
    const verbFrequency = new Map<string, number>();
    for (const word of words) {
        const lower = word.toLowerCase().replace(/[^a-z]/g, "");
        if (lower.length > 2) {
            verbFrequency.set(lower, (verbFrequency.get(lower) || 0) + 1);
        }
    }

    const overusedVerbs: string[] = [];
    for (const [verb, count] of verbFrequency) {
        if (count > 3) {
            overusedVerbs.push(`'${verb}' (${count}×)`);
        }
    }

    if (overusedVerbs.length > 0) {
        score -= 5;
        details.push(
            `⚠️ Repetitive words: ${overusedVerbs.slice(0, 3).join(", ")} — vary your language`
        );
    } else {
        details.push("✅ Good vocabulary variety");
    }

    // 3. Acronym density (-5 if > 15 unique acronyms)
    const acronymRegex = /\b[A-Z]{3,}\b/g;
    const acronymMatches = input.rawText.match(acronymRegex);
    const uniqueAcronyms = new Set(acronymMatches || []);
    if (uniqueAcronyms.size > 15) {
        score -= 5;
        details.push(
            `⚠️ High acronym density (${uniqueAcronyms.size} unique) — consider spelling out some abbreviations`
        );
    } else {
        details.push("✅ Appropriate acronym usage");
    }

    // 4. Paragraph blocks (-5 if any block > 100 words)
    const paragraphs = input.rawText.split(/\n\s*\n/);
    let hasLargeBlock = false;
    for (const para of paragraphs) {
        const trimmed = para.trim();
        // Skip if it looks like a bulleted section
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
            continue;
        }
        const paraWords = trimmed.split(/\s+/).filter((w) => w.length > 0);
        if (paraWords.length > 100) {
            hasLargeBlock = true;
            break;
        }
    }

    if (hasLargeBlock) {
        score -= 5;
        details.push(
            "⚠️ Large text blocks detected — break content into bullet points for better readability"
        );
    } else {
        details.push("✅ Content is well-structured");
    }

    score = Math.max(0, Math.min(100, score));

    return {
        category: "readability",
        score,
        maxScore: 100,
        feedback:
            score >= 90
                ? "Excellent readability — your resume is easy to scan."
                : score >= 70
                    ? "Good readability with minor improvements possible."
                    : "Several readability issues detected — simplify and restructure.",
        suggestions: details.filter((d) => d.startsWith("⚠️") || d.startsWith("❌")),
    };
}
