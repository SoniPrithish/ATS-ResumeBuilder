/**
 * @module modules/ats/bullet-scorer
 * @description Scores bullet point quality for ATS and recruiter readability.
 * Evaluates action verbs, quantified results, length, and STAR/XYZ format.
 */

import type { CategoryScore } from "@/types/ats";
import type { BulletInput } from "./types";
import { ACTION_VERBS, WEAK_VERBS } from "./keyword-database";

/** Lower-cased set of action verbs for O(1) lookup */
const actionVerbSet = new Set(ACTION_VERBS.map((v) => v.toLowerCase()));

/** Regex for quantified results */
const QUANTIFICATION_REGEX =
    /\d+%|\$[\d,.]+|\d+[kKmM]\b|\d+x\b|\d+\+?\s*(users|customers|requests|transactions|endpoints|services|applications|features|projects|team|engineers|developers|servers|releases|deployments|tests|bugs)/i;

/**
 * Score the quality of resume bullet points.
 * Each bullet is scored 0-10. The average is normalized to 0-100.
 *
 * @param input - Bullet scoring input
 * @returns CategoryScore with bullet analysis
 */
export function scoreBullets(input: BulletInput): CategoryScore {
    if (input.bullets.length === 0) {
        return {
            category: "bullets",
            score: 0,
            maxScore: 100,
            feedback: "No bullet points found in your resume.",
            suggestions: [
                "❌ No bullet points found — add achievement-based bullets to your experience section",
            ],
        };
    }

    const bulletScores: { bullet: string; score: number; feedback: string[] }[] =
        [];

    for (const bullet of input.bullets) {
        const result = scoreSingleBullet(bullet);
        bulletScores.push(result);
    }

    // Calculate average
    const totalBulletScore = bulletScores.reduce((sum, b) => sum + b.score, 0);
    const avgScore = totalBulletScore / bulletScores.length;
    const normalizedScore = Math.max(
        0,
        Math.min(100, Math.round((avgScore / 10) * 100))
    );

    // Build details
    const suggestions: string[] = [];

    // Worst 5 bullets
    const sorted = [...bulletScores].sort((a, b) => a.score - b.score);
    const worst = sorted.slice(0, Math.min(5, sorted.length));
    for (const w of worst) {
        if (w.score < 7) {
            const truncated =
                w.bullet.length > 60 ? w.bullet.slice(0, 60) + "…" : w.bullet;
            suggestions.push(
                `⚠️ "${truncated}" — ${w.feedback.join("; ")}`
            );
        }
    }

    // Best 3 bullets — encouragement
    const best = sorted.slice(-Math.min(3, sorted.length)).reverse();
    for (const b of best) {
        if (b.score >= 7) {
            const truncated =
                b.bullet.length > 60 ? b.bullet.slice(0, 60) + "…" : b.bullet;
            suggestions.push(`✅ Strong bullet: "${truncated}"`);
        }
    }

    return {
        category: "bullets",
        score: normalizedScore,
        maxScore: 100,
        feedback:
            normalizedScore >= 80
                ? "Your bullet points are strong and action-oriented."
                : normalizedScore >= 60
                    ? "Decent bullet quality — room for improvement."
                    : normalizedScore >= 40
                        ? "Many bullets need stronger action verbs and quantified results."
                        : "Most bullets need significant improvement — use the STAR/XYZ method.",
        suggestions: suggestions.filter(
            (d) => d.startsWith("⚠️") || d.startsWith("❌") || d.startsWith("✅")
        ),
    };
}

/**
 * Score a single bullet from 0-10 based on multiple quality criteria.
 */
function scoreSingleBullet(bullet: string): {
    bullet: string;
    score: number;
    feedback: string[];
} {
    let score = 0;
    const feedback: string[] = [];
    const words = bullet.trim().split(/\s+/);
    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";

    // 1. Starts with action verb (+3)
    const hasActionVerb = actionVerbSet.has(firstWord);
    if (hasActionVerb) {
        score += 3;
    } else {
        feedback.push("start with an action verb");
    }

    // 2. Contains quantified result (+3)
    const hasQuantification = QUANTIFICATION_REGEX.test(bullet);
    if (hasQuantification) {
        score += 3;
    } else {
        feedback.push("add measurable results");
    }

    // 3. Appropriate length (15-30 words) → +2
    const wordCount = words.length;
    if (wordCount >= 15 && wordCount <= 30) {
        score += 2;
    } else if (wordCount >= 10 && wordCount <= 40) {
        score += 1;
        if (wordCount < 15) feedback.push("bullet is too short");
        if (wordCount > 30) feedback.push("bullet is too long");
    } else {
        if (wordCount < 10) feedback.push("bullet is too short");
        if (wordCount > 40) feedback.push("bullet is too long");
    }

    // 4. Avoids weak verbs (+1, else -2)
    const bulletLower = bullet.toLowerCase();
    const usesWeakVerb = WEAK_VERBS.some((wv) => {
        // Check if bullet starts with the weak verb phrase
        return bulletLower.startsWith(wv.toLowerCase());
    });

    if (!usesWeakVerb) {
        score += 1;
    } else {
        score -= 2;
        feedback.push("avoid weak verbs like 'helped' or 'responsible for'");
    }

    // 5. Has BOTH action verb AND quantified result (STAR/XYZ format) → +1
    if (hasActionVerb && hasQuantification) {
        score += 1;
    }

    score = Math.max(0, Math.min(10, score));

    return { bullet, score, feedback };
}
