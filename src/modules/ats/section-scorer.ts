/**
 * @module modules/ats/section-scorer
 * @description Scores resume section completeness.
 * Awards points for the presence and depth of each major section.
 */

import type { CategoryScore } from "@/types/ats";
import type { SectionInput } from "./types";

/**
 * Score the completeness and depth of resume sections.
 * Point allocation totals 100 across all categories.
 *
 * @param input - Section scoring input
 * @returns CategoryScore with section analysis
 */
export function scoreSections(input: SectionInput): CategoryScore {
    let score = 0;
    const details: string[] = [];

    // Contact Info: 15 pts
    if (input.hasContact) {
        score += 15;
        details.push("✅ Contact information present (15/15)");
    } else {
        details.push("❌ Missing contact information (0/15)");
    }

    // Summary: 10 pts
    if (input.hasSummary) {
        score += 10;
        details.push("✅ Professional summary included (10/10)");
    } else {
        details.push("⚠️ No professional summary — add a brief overview (0/10)");
    }

    // Experience: 30 pts
    let expScore = 0;
    if (input.experienceCount >= 1) {
        expScore += 15;
    }
    if (input.experienceCount >= 2) {
        expScore += 10;
    }
    if (
        input.experienceCount > 0 &&
        input.experienceBulletCount / input.experienceCount >= 3
    ) {
        expScore += 5;
    }
    score += expScore;
    if (expScore === 30) {
        details.push("✅ Experience section well populated (30/30)");
    } else if (expScore > 0) {
        details.push(`⚠️ Experience section could be stronger (${expScore}/30)`);
    } else {
        details.push("❌ No work experience listed (0/30)");
    }

    // Education: 20 pts
    let eduScore = 0;
    if (input.educationCount >= 1) {
        eduScore += 15;
    }
    if (input.educationCount >= 2) {
        eduScore += 5;
    }
    score += eduScore;
    if (eduScore === 20) {
        details.push("✅ Education section complete (20/20)");
    } else if (eduScore > 0) {
        details.push(`✅ Education section present (${eduScore}/20)`);
    } else {
        details.push("❌ No education listed (0/20)");
    }

    // Skills: 15 pts
    let skillScore = 0;
    if (input.skillCount >= 16) {
        skillScore = 15;
    } else if (input.skillCount >= 6) {
        skillScore = 10;
    } else if (input.skillCount >= 1) {
        skillScore = 5;
    }
    score += skillScore;
    if (skillScore === 15) {
        details.push("✅ Strong skills section (15/15)");
    } else if (skillScore > 0) {
        details.push(
            `⚠️ Skills section could be expanded (${skillScore}/15) — add more relevant skills`
        );
    } else {
        details.push("❌ No skills listed (0/15)");
    }

    // Projects: 5 pts (bonus)
    if (input.hasProjects) {
        score += 5;
        details.push("✅ Projects section included (+5 bonus)");
    }

    // Certifications: 5 pts (bonus)
    if (input.hasCertifications) {
        score += 5;
        details.push("✅ Certifications section included (+5 bonus)");
    }

    // Cap at 100
    score = Math.min(100, score);

    return {
        category: "sections",
        score,
        maxScore: 100,
        feedback:
            score >= 90
                ? "All key resume sections are present and well-developed."
                : score >= 70
                    ? "Most sections are present — a few areas could be expanded."
                    : score >= 50
                        ? "Several important sections are missing or incomplete."
                        : "Your resume is missing critical sections.",
        suggestions: details.filter((d) => d.startsWith("⚠️") || d.startsWith("❌")),
    };
}
