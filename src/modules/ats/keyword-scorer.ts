/**
 * @module modules/ats/keyword-scorer
 * @description Scores keyword density and relevance against job descriptions
 * or general tech keyword database. Two modes: with JD keywords or general.
 */

import type { CategoryScore } from "@/types/ats";
import type { KeywordInput } from "./types";
import { TECH_KEYWORD_DATABASE } from "./keyword-database";

/**
 * Score keyword usage in a resume.
 *
 * Mode A: With target keywords (JD provided) — measures match rate.
 * Mode B: Without target keywords — measures breadth from global database.
 *
 * @param input - Keyword scoring input
 * @returns CategoryScore with keyword analysis
 */
export function scoreKeywords(input: KeywordInput): CategoryScore {
    if (input.targetKeywords && input.targetKeywords.length > 0) {
        return scoreWithTargetKeywords(input);
    }
    return scoreGeneralKeywords(input);
}

// ── Mode A: JD-based keyword matching ─────────────────────

function scoreWithTargetKeywords(input: KeywordInput): CategoryScore {
    const targetKeywords = input.targetKeywords!;
    const rawTextLower = input.rawText.toLowerCase();

    // Flatten all skills into a lowercase set
    const allSkills = getAllSkillsLower(input.resumeSkills);

    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of targetKeywords) {
        const keywordLower = keyword.toLowerCase();
        const found =
            allSkills.has(keywordLower) || rawTextLower.includes(keywordLower);
        if (found) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    }

    // Base score: match percentage
    let score =
        targetKeywords.length > 0
            ? Math.round((matched.length / targetKeywords.length) * 100)
            : 0;

    // Bonus: keyword found in both skills section AND raw experience text (+5 per, max +15)
    let bonus = 0;
    for (const keyword of matched) {
        const keywordLower = keyword.toLowerCase();
        if (allSkills.has(keywordLower) && rawTextLower.includes(keywordLower)) {
            bonus += 5;
        }
        if (bonus >= 15) break;
    }
    score += bonus;

    // Penalty: keyword stuffing (-5 per keyword appearing > 5 times)
    let stuffingPenalty = 0;
    for (const keyword of matched) {
        const regex = new RegExp(escapeRegex(keyword.toLowerCase()), "gi");
        const matchCount = (input.rawText.match(regex) || []).length;
        if (matchCount > 5) {
            stuffingPenalty += 5;
        }
    }
    score -= stuffingPenalty;

    score = Math.max(0, Math.min(100, score));

    const details: string[] = [];
    if (matched.length > 0) {
        details.push(
            `✅ Matched keywords: ${matched.slice(0, 10).join(", ")}${matched.length > 10 ? ` (+${matched.length - 10} more)` : ""}`
        );
    }
    if (missing.length > 0) {
        details.push(
            `❌ Missing keywords: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` (+${missing.length - 5} more)` : ""}`
        );
    }
    if (stuffingPenalty > 0) {
        details.push(
            "⚠️ Keyword stuffing detected — some keywords appear too frequently"
        );
    }

    return {
        category: "keywords",
        score,
        maxScore: 100,
        feedback: `Matched ${matched.length} of ${targetKeywords.length} target keywords.`,
        suggestions: details.filter((d) => d.startsWith("❌") || d.startsWith("⚠️")),
    };
}

// ── Mode B: General keyword scoring ───────────────────────

function scoreGeneralKeywords(input: KeywordInput): CategoryScore {
    const rawTextLower = input.rawText.toLowerCase();
    const allSkills = getAllSkillsLower(input.resumeSkills);

    const foundKeywords = new Set<string>();
    const categoriesFound = new Set<string>();

    // Scan through the database
    for (const [keyword, category] of TECH_KEYWORD_DATABASE) {
        if (allSkills.has(keyword) || rawTextLower.includes(keyword)) {
            foundKeywords.add(keyword);
            categoriesFound.add(category);
        }
    }

    const count = foundKeywords.size;
    let score: number;

    if (count < 10) {
        score = 40;
    } else if (count <= 20) {
        score = 60;
    } else if (count <= 35) {
        score = 80;
    } else {
        score = 95;
    }

    // Bonus for skill diversity (multiple categories)
    if (categoriesFound.size >= 3) {
        score += 5;
    }

    score = Math.max(0, Math.min(100, score));

    const topKeywords = Array.from(foundKeywords).slice(0, 10);
    const details: string[] = [];
    details.push(`✅ Found ${count} tech keywords across ${categoriesFound.size} categories`);
    if (topKeywords.length > 0) {
        details.push(`Top keywords: ${topKeywords.join(", ")}`);
    }
    if (count < 20) {
        details.push(
            "⚠️ Consider adding more industry-specific keywords to your resume"
        );
    }

    return {
        category: "keywords",
        score,
        maxScore: 100,
        feedback:
            count >= 35
                ? "Excellent keyword coverage across multiple domains."
                : count >= 20
                    ? "Good keyword density — consider adding a few more."
                    : count >= 10
                        ? "Moderate keyword coverage — your resume could benefit from more tech terms."
                        : "Low keyword density — add more relevant skills and technologies.",
        suggestions: details.filter((d) => d.startsWith("⚠️") || d.startsWith("❌")),
    };
}

// ── Helpers ────────────────────────────────────────────────

function getAllSkillsLower(
    skills: import("@/types/resume").SkillSet
): Set<string> {
    const allSkills = new Set<string>();
    for (const skill of skills.technical ?? []) allSkills.add(skill.toLowerCase());
    for (const skill of skills.soft ?? []) allSkills.add(skill.toLowerCase());
    for (const skill of skills.tools ?? []) allSkills.add(skill.toLowerCase());
    for (const skill of skills.languages ?? []) allSkills.add(skill.toLowerCase());
    for (const skill of skills.certifications ?? []) allSkills.add(skill.toLowerCase());
    return allSkills;
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
