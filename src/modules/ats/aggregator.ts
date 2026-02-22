/**
 * @module modules/ats/aggregator
 * @description Core ATS scoring aggregator. Builds inputs from CanonicalResume,
 * calls each category scorer, calculates weighted overall score, and generates
 * suggestions.
 */

import type { CanonicalResume } from "@/types/resume";
import type { ATSScore, ATSBreakdown } from "@/types/ats";
import type {
    ATSScoringConfig,
    FormatInput,
    KeywordInput,
    SectionInput,
    BulletInput,
    ReadabilityInput,
} from "./types";
import { DEFAULT_ATS_CONFIG } from "./types";
import { scoreFormat } from "./format-scorer";
import { scoreKeywords } from "./keyword-scorer";
import { scoreSections } from "./section-scorer";
import { scoreBullets } from "./bullet-scorer";
import { scoreReadability } from "./readability-scorer";
import { generateSuggestions } from "./suggestion-generator";

/**
 * Calculate a complete ATS score from a CanonicalResume.
 * Uses null for fileType since it's not available from the resume alone.
 *
 * @param resume - The canonical resume to score
 * @param config - Optional scoring config (weights)
 * @returns Complete ATSScore with breakdown and suggestions
 */
export function calculateATSScore(
    resume: CanonicalResume,
    config: ATSScoringConfig = DEFAULT_ATS_CONFIG
): ATSScore {
    return calculateATSScoreWithFileType(resume, null, undefined, config);
}

/**
 * Calculate a complete ATS score with explicit file type and optional JD keywords.
 * This is the full-featured entry point for more accurate scoring.
 *
 * @param resume - The canonical resume to analyze
 * @param fileType - The file type ('pdf', 'docx', or null)
 * @param targetKeywords - Optional JD keywords for targeted scoring
 * @param config - Optional scoring config
 * @returns Complete ATSScore with breakdown and suggestions
 */
export function calculateATSScoreWithFileType(
    resume: CanonicalResume,
    fileType: string | null,
    targetKeywords?: string[],
    config: ATSScoringConfig = DEFAULT_ATS_CONFIG
): ATSScore {
    // Build raw text from resume fields if not present
    const rawText = buildRawText(resume);

    // 1. Build inputs for each scorer
    const formatInput: FormatInput = {
        fileType,
        rawText,
        hasContactInfo: Boolean(
            resume.contactInfo.email || resume.contactInfo.phone
        ),
    };

    const keywordInput: KeywordInput = {
        resumeSkills: resume.skills,
        rawText,
        targetKeywords,
    };

    // Collect all bullets from experience + projects
    const allBullets = collectBullets(resume);

    const sectionInput: SectionInput = {
        hasContact: Boolean(
            resume.contactInfo.email || resume.contactInfo.fullName
        ),
        hasSummary: Boolean(resume.summary && resume.summary.trim().length > 0),
        experienceCount: resume.experience.length,
        experienceBulletCount: resume.experience.reduce(
            (sum, exp) => sum + exp.bullets.length,
            0
        ),
        educationCount: resume.education.length,
        skillCount: countSkills(resume.skills),
        hasProjects: Boolean(resume.projects && resume.projects.length > 0),
        hasCertifications: Boolean(
            resume.certifications && resume.certifications.length > 0
        ),
    };

    const bulletInput: BulletInput = {
        bullets: allBullets,
    };

    const readabilityInput: ReadabilityInput = {
        rawText,
        bulletCount: allBullets.length,
    };

    // 2. Call each scorer
    const format = scoreFormat(formatInput);
    const keywords = scoreKeywords(keywordInput);
    const sections = scoreSections(sectionInput);
    const bullets = scoreBullets(bulletInput);
    const readability = scoreReadability(readabilityInput);

    // 3. Calculate weighted overall score
    const weights = config.weights;
    const overall = Math.round(
        (format.score * weights.format +
            keywords.score * weights.keywords +
            sections.score * weights.sections +
            bullets.score * weights.bullets +
            readability.score * weights.readability) /
        100
    );

    // 4. Build breakdown
    const breakdown: ATSBreakdown = {
        // ATSBreakdown expects these specific keys
        keywords,
        formatting: format,
        experience: bullets,
        education: sections,
        skills: readability,
        // Also expose as our named categories for internal use
        format,
        sections,
        bullets,
        readability,
    };

    // 5. Generate suggestions from breakdown
    const suggestions = generateSuggestions(breakdown);

    return {
        overallScore: Math.max(0, Math.min(100, overall)),
        breakdown,
        suggestions,
        analyzedAt: new Date().toISOString(),
    };
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Build a plain-text representation of the resume for text analysis.
 */
function buildRawText(resume: CanonicalResume): string {
    const parts: string[] = [];

    // Contact
    if (resume.contactInfo.fullName) parts.push(resume.contactInfo.fullName);
    if (resume.contactInfo.email) parts.push(resume.contactInfo.email);
    if (resume.contactInfo.phone) parts.push(resume.contactInfo.phone);
    if (resume.contactInfo.location) parts.push(resume.contactInfo.location);

    // Summary
    if (resume.summary) parts.push(resume.summary);

    // Experience
    for (const exp of resume.experience) {
        parts.push(`${exp.title} at ${exp.company}`);
        if (exp.location) parts.push(exp.location);
        parts.push(`${exp.startDate} - ${exp.endDate ?? "Present"}`);
        for (const bullet of exp.bullets) {
            parts.push(`• ${bullet}`);
        }
        if (exp.technologies && exp.technologies.length > 0) {
            parts.push(`Technologies: ${exp.technologies.join(", ")}`);
        }
    }

    // Education
    for (const edu of resume.education) {
        parts.push(`${edu.degree} in ${edu.field}`);
        parts.push(edu.institution);
        if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
        if (edu.honors) parts.push(edu.honors.join(", "));
        if (edu.coursework) parts.push(edu.coursework.join(", "));
    }

    // Skills
    const skills = resume.skills;
    if (skills.technical.length > 0) parts.push(`Technical: ${skills.technical.join(", ")}`);
    if (skills.soft.length > 0) parts.push(`Soft Skills: ${skills.soft.join(", ")}`);
    if (skills.tools.length > 0) parts.push(`Tools: ${skills.tools.join(", ")}`);
    if (skills.languages && skills.languages.length > 0)
        parts.push(`Languages: ${skills.languages.join(", ")}`);
    if (skills.certifications && skills.certifications.length > 0)
        parts.push(`Certifications: ${skills.certifications.join(", ")}`);

    // Projects
    if (resume.projects) {
        for (const proj of resume.projects) {
            parts.push(proj.name);
            parts.push(proj.description);
            if (proj.highlights) {
                for (const h of proj.highlights) {
                    parts.push(`• ${h}`);
                }
            }
            if (proj.technologies.length > 0) {
                parts.push(`Technologies: ${proj.technologies.join(", ")}`);
            }
        }
    }

    // Certifications
    if (resume.certifications) {
        for (const cert of resume.certifications) {
            parts.push(`${cert.name} — ${cert.issuer}`);
        }
    }

    return parts.join("\n");
}

/**
 * Collect all bullet points from experience and project highlights.
 */
function collectBullets(resume: CanonicalResume): string[] {
    const bullets: string[] = [];

    for (const exp of resume.experience) {
        bullets.push(...exp.bullets);
    }

    if (resume.projects) {
        for (const proj of resume.projects) {
            if (proj.highlights) {
                bullets.push(...proj.highlights);
            }
        }
    }

    return bullets;
}

/**
 * Count total skills across all categories.
 */
function countSkills(skills: CanonicalResume["skills"]): number {
    return (
        (skills.technical?.length ?? 0) +
        (skills.soft?.length ?? 0) +
        (skills.tools?.length ?? 0) +
        (skills.languages?.length ?? 0) +
        (skills.certifications?.length ?? 0)
    );
}
