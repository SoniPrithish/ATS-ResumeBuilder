/**
 * @module modules/ats/suggestion-generator
 * @description Generates actionable suggestions from ATS category scores.
 * Each category with score < 90 receives a tailored suggestion with
 * appropriate severity (critical, warning, or info).
 */

import type { ATSBreakdown, ATSSuggestion } from "@/types/ats";
import { nanoid } from "nanoid";

/**
 * Map a score to a priority level.
 */
function scoreToPriority(score: number): "high" | "medium" | "low" | null {
    if (score < 40) return "high";
    if (score < 70) return "medium";
    if (score < 90) return "low";
    return null; // No suggestion needed
}

/**
 * Generate actionable, category-specific suggestions based on the ATS breakdown.
 *
 * @param breakdown - The complete ATS scoring breakdown
 * @returns Sorted array of suggestions (critical → warning → info)
 */
export function generateSuggestions(breakdown: ATSBreakdown): ATSSuggestion[] {
    const suggestions: ATSSuggestion[] = [];

    // ── Format ────────────────────────────────────────────
    if (breakdown.format) {
        const priority = scoreToPriority(breakdown.format.score);
        if (priority) {
            const message = getFormatMessage(breakdown.format.score, breakdown.format.suggestions);
            suggestions.push({
                id: nanoid(),
                category: "format",
                priority,
                message,
                section: "format",
            });
        }
    }

    // ── Keywords ──────────────────────────────────────────
    if (breakdown.keywords) {
        const priority = scoreToPriority(breakdown.keywords.score);
        if (priority) {
            const message = getKeywordMessage(breakdown.keywords.score, breakdown.keywords.suggestions);
            suggestions.push({
                id: nanoid(),
                category: "keywords",
                priority,
                message,
                section: "skills",
            });
        }
    }

    // ── Sections ──────────────────────────────────────────
    if (breakdown.sections) {
        const priority = scoreToPriority(breakdown.sections.score);
        if (priority) {
            const message = getSectionMessage(breakdown.sections.score, breakdown.sections.suggestions);
            suggestions.push({
                id: nanoid(),
                category: "sections",
                priority,
                message,
                section: "structure",
            });
        }
    }

    // ── Bullets ───────────────────────────────────────────
    if (breakdown.bullets) {
        const priority = scoreToPriority(breakdown.bullets.score);
        if (priority) {
            const message = getBulletMessage(breakdown.bullets.score);
            suggestions.push({
                id: nanoid(),
                category: "bullets",
                priority,
                message,
                section: "experience",
            });
        }
    }

    // ── Readability ───────────────────────────────────────
    if (breakdown.readability) {
        const priority = scoreToPriority(breakdown.readability.score);
        if (priority) {
            const message = getReadabilityMessage(
                breakdown.readability.score,
                breakdown.readability.suggestions
            );
            suggestions.push({
                id: nanoid(),
                category: "readability",
                priority,
                message,
                section: "overall",
            });
        }
    }

    // Sort: critical (high) → warning (medium) → info (low)
    const priorityOrder: Record<string, number> = {
        high: 0,
        medium: 1,
        low: 2,
    };

    return suggestions.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
}

// ── Category-specific message builders ────────────────────

function getFormatMessage(score: number, details: string[]): string {
    if (score < 40) {
        return (
            "Multi-column layout detected. Use a single-column, ATS-friendly template. " +
            "Avoid tables, text boxes, and special characters that confuse ATS parsers."
        );
    }
    if (score < 70) {
        const issues = details.filter((d) => d.startsWith("⚠️") || d.startsWith("❌"));
        return (
            "Your resume has formatting issues that may affect ATS parsing. " +
            (issues.length > 0 ? issues[0].replace(/^[⚠️❌]\s*/, "") : "Consider using a cleaner format.")
        );
    }
    return "Minor formatting adjustments could improve ATS compatibility.";
}

function getKeywordMessage(score: number, details: string[]): string {
    const missing = details.find((d) => d.includes("Missing"));
    if (score < 40) {
        return (
            "Critical keyword gap detected. " +
            (missing ? missing.replace(/^[❌]\s*/, "") + "." : "Add more industry-relevant keywords from the job description.")
        );
    }
    if (score < 70) {
        return (
            "You're missing several target keywords. " +
            (missing ? missing.replace(/^[❌]\s*/, "") + "." : "Review the job description and incorporate matching terms.")
        );
    }
    return "You could improve keyword coverage by adding a few more relevant terms.";
}

function getSectionMessage(score: number, details: string[]): string {
    const missingSections = details
        .filter((d) => d.startsWith("❌") || d.startsWith("⚠️"))
        .map((d) => d.replace(/^[❌⚠️]\s*/, "").split("(")[0].trim());

    if (score < 40) {
        return (
            "Your resume is missing critical sections. " +
            (missingSections.length > 0
                ? "Issues: " + missingSections.join("; ") + "."
                : "Add Experience, Education, and Skills sections.")
        );
    }
    if (score < 70) {
        return (
            "Your resume is missing some sections. " +
            (missingSections.length > 0
                ? missingSections.join("; ") + "."
                : "Consider adding a Summary, Projects, or Certifications section.")
        );
    }
    return "Consider adding optional sections like Projects or Certifications for a more complete resume.";
}

function getBulletMessage(score: number): string {
    if (score < 40) {
        return (
            "Most bullet points use weak language. Replace phrases like 'Responsible for' " +
            "with strong action verbs like 'Developed', 'Led', 'Optimized'. " +
            "Add quantified results (e.g., 'Reduced latency by 40%')."
        );
    }
    if (score < 70) {
        return (
            "Several bullet points could be strengthened. Start each bullet with a " +
            "strong action verb and include measurable results where possible."
        );
    }
    return "Some bullets could benefit from more specific metrics and results.";
}

function getReadabilityMessage(score: number, details: string[]): string {
    const issues = details.filter((d) => d.startsWith("⚠️"));
    if (score < 40) {
        return (
            "Significant readability issues detected. " +
            (issues.length > 0 ? issues[0].replace(/^[⚠️]\s*/, "") : "Simplify your content and break large blocks into bullet points.")
        );
    }
    if (score < 70) {
        return (
            "Readability could be improved. " +
            (issues.length > 0 ? issues[0].replace(/^[⚠️]\s*/, "") + "." : "Vary your vocabulary and trim excess content.")
        );
    }
    return "Minor readability improvements possible — consider varying word choice.";
}
