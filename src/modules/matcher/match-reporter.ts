import { analyzeOverlap } from "@/modules/matcher/overlap-analyzer";
import { calculateSimilarity } from "@/modules/matcher/similarity-engine";
import type { MatchReport } from "@/modules/matcher/types";
import { extractKeywordsFromText } from "@/modules/matcher/keyword-extractor";
import { detectGaps } from "@/modules/skillgap/gap-detector";
import { rankGaps } from "@/modules/skillgap/priority-ranker";
import type { ParsedJobDescription } from "@/types/job";
import type { CanonicalResume } from "@/types/resume";

function clampScore(value: number): number {
    return Math.max(0, Math.min(100, value));
}

function experienceScore(resume: CanonicalResume, jd: ParsedJobDescription): number {
    let score = 0;
    const jdTitleTerms = jd.title.toLowerCase().split(/\s+/).filter(Boolean);

    const titleMatch = resume.experience.some((exp) =>
        jdTitleTerms.some((term) => exp.title.toLowerCase().includes(term))
    );

    if (titleMatch) {
        score += 30;
    }

    const jdSignalTerms = Array.from(new Set([...jd.keywords.hardSkills, ...jd.keywords.tools]));
    const bullets = resume.experience.flatMap((exp) => exp.bullets ?? []);
    const bulletText = bullets.join(" ").toLowerCase();

    const matchedSignals = jdSignalTerms.filter((term) =>
        new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "i").test(bulletText)
    ).length;

    if (jdSignalTerms.length > 0) {
        score += (matchedSignals / jdSignalTerms.length) * 70;
    }

    return clampScore(score);
}

function buildSuggestions(report: {
    overlapPercentage: number;
    similarityScore: number;
    missingRequired: string[];
    rankedGapSkills: string[];
    expScore: number;
    topMatched: string[];
    jdResponsibilities: string[];
}): string[] {
    const suggestions: string[] = [];

    if (report.missingRequired.length > 0) {
        suggestions.push(
            `Add these keywords to your Skills section: ${report.missingRequired.slice(0, 8).join(", ")}`
        );
    }

    if (report.similarityScore < 55) {
        suggestions.push(
            "Your resume language doesn't closely match this JD. Consider mirroring the JD's terminology."
        );
    }

    if (report.rankedGapSkills.length > 0) {
        suggestions.push(
            `You're missing ${report.rankedGapSkills.length} required skills. Top priorities: ${report.rankedGapSkills
                .slice(0, 3)
                .join(", ")}`
        );
    }

    if (report.expScore < 50) {
        suggestions.push(
            `Your experience bullets don't highlight skills relevant to this role. Consider tailoring bullets for: ${report.jdResponsibilities
                .slice(0, 3)
                .join("; ")}`
        );
    }

    if (report.overlapPercentage > 80) {
        suggestions.push(
            `Strong match! Focus on highlighting ${report.topMatched.slice(0, 5).join(", ")} prominently.`
        );
    }

    return suggestions;
}

export function generateMatchReport(resume: CanonicalResume, jd: ParsedJobDescription): MatchReport {
    const resumeText = [
        resume.summary ?? "",
        resume.experience.flatMap((item) => [item.title, ...item.bullets, ...(item.technologies ?? [])]).join(" "),
        resume.projects?.flatMap((item) => [item.name, item.description, ...(item.highlights ?? [])]).join(" ") ?? "",
        [
            ...resume.skills.technical,
            ...resume.skills.soft,
            ...resume.skills.tools,
            ...(resume.skills.languages ?? []),
            ...(resume.skills.certifications ?? []),
        ].join(" "),
    ].join("\n");

    const resumeKeywords = extractKeywordsFromText(resumeText);
    const similarity = calculateSimilarity(resumeText, jd.rawText);
    const overlap = analyzeOverlap(resumeKeywords, jd.keywords, resume);
    const gaps = detectGaps(resume.skills, jd.keywords);
    const rankedGaps = rankGaps(gaps);

    const keywordScore = clampScore(overlap.matchPercentage);
    const similarityScore = clampScore(similarity.cosineSimilarity * 100);

    const jdHardSkills = jd.keywords.hardSkills.length;
    const matchedHardSkills = overlap.matched.filter((item) => item.category === "hardSkill").length;
    const skillCoverageScore = jdHardSkills > 0 ? clampScore((matchedHardSkills / jdHardSkills) * 100) : 100;

    const experienceRelevanceScore = experienceScore(resume, jd);

    const overallScore = clampScore(
        keywordScore * 0.35 +
            similarityScore * 0.25 +
            skillCoverageScore * 0.25 +
            experienceRelevanceScore * 0.15
    );

    const suggestions = buildSuggestions({
        overlapPercentage: keywordScore,
        similarityScore,
        missingRequired: overlap.missing.filter((item) => item.importance === "required").map((item) => item.keyword),
        rankedGapSkills: rankedGaps.map((item) => item.skill),
        expScore: experienceRelevanceScore,
        topMatched: overlap.matched.map((item) => item.keyword),
        jdResponsibilities: jd.responsibilities,
    });

    return {
        overallScore,
        keywordScore,
        similarityScore,
        skillCoverageScore,
        experienceRelevanceScore,
        matchedKeywords: overlap.matched,
        missingKeywords: overlap.missing,
        suggestions,
        skillGaps: rankedGaps,
    };
}
