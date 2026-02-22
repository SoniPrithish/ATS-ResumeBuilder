import { extractKeywordsFromText, YEARS_EXPERIENCE_REGEX } from "@/modules/matcher/keyword-extractor";
import type { ExperienceLevel, ParsedJobDescription } from "@/types/job";

const SECTION_PATTERNS = {
    requirements: /^(required\s+)?(qualifications?|requirements?|what\s+you('ll)?\s+need|must\s+have|minimum\s+qualifications?)/i,
    preferred: /^(preferred|nice\s+to\s+have|bonus|desired|additional\s+qualifications?|preferred\s+qualifications?)/i,
    responsibilities: /^(responsibilities|what\s+you('ll)?\s+do|role\s+description|key\s+duties|about\s+the\s+role)/i,
    about: /^(about\s+(us|the\s+company|the\s+team))/i,
    benefits: /^(benefits|perks|what\s+we\s+offer|compensation)/i,
};

const TITLE_PATTERN = /^(senior\s+|junior\s+|lead\s+|staff\s+|principal\s+)?[\w\s]+(engineer|developer|architect|manager|analyst|scientist|designer)/i;

function parseExperienceLevel(text: string): ExperienceLevel {
    const years = Number.parseInt(text.match(YEARS_EXPERIENCE_REGEX)?.[1] ?? "0", 10);

    if (years >= 10) {
        return "principal";
    }

    if (years >= 7) {
        return "lead";
    }

    if (years >= 4) {
        return "senior";
    }

    if (years >= 2) {
        return "mid";
    }

    return "entry";
}

function normalizeBullet(line: string): string {
    return line
        .replace(/^\s*(?:[-•*>]|\d+\.)\s*/, "")
        .trim();
}

export function parseJobDescription(rawText: string): ParsedJobDescription {
    const safeText = rawText?.trim() ?? "";
    const lines = safeText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const title = lines.find((line) => TITLE_PATTERN.test(line)) ?? lines[0] ?? "Untitled Role";

    const companyFromAt = safeText.match(/\bat\s+([A-Z][\w&.,\-\s]{1,80})/);
    const companyFromLabel = safeText.match(/company\s*:\s*([^\n]+)/i);
    const company =
        companyFromLabel?.[1]?.trim() ??
        companyFromAt?.[1]?.trim() ??
        lines[1] ??
        "Unknown Company";

    const sections = {
        requirements: [] as string[],
        preferred: [] as string[],
        responsibilities: [] as string[],
        about: [] as string[],
        benefits: [] as string[],
    };

    let currentSection: keyof typeof sections = "requirements";

    for (const line of lines.slice(1)) {
        if (SECTION_PATTERNS.requirements.test(line)) {
            currentSection = "requirements";
            continue;
        }

        if (SECTION_PATTERNS.preferred.test(line)) {
            currentSection = "preferred";
            continue;
        }

        if (SECTION_PATTERNS.responsibilities.test(line)) {
            currentSection = "responsibilities";
            continue;
        }

        if (SECTION_PATTERNS.about.test(line)) {
            currentSection = "about";
            continue;
        }

        if (SECTION_PATTERNS.benefits.test(line)) {
            currentSection = "benefits";
            continue;
        }

        const bullet = normalizeBullet(line);
        if (bullet) {
            sections[currentSection].push(bullet);
        }
    }

    if (
        sections.requirements.length === 0 &&
        sections.preferred.length === 0 &&
        sections.responsibilities.length === 0
    ) {
        sections.requirements.push(...lines.slice(1).map(normalizeBullet).filter(Boolean));
    }

    const keywords = extractKeywordsFromText(safeText);

    return {
        title,
        company,
        rawText: safeText,
        experienceLevel: parseExperienceLevel(safeText),
        keywords,
        responsibilities: sections.responsibilities,
        requirements: sections.requirements,
        preferred: sections.preferred,
        qualifications: [...sections.requirements, ...sections.preferred],
        location: undefined,
        remote: /\bremote\b/i.test(safeText),
    };
}
