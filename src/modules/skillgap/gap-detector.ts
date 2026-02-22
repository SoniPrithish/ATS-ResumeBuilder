import { levenshteinDistance, SKILL_SIMILARITY_MAP } from "@/modules/matcher/skill-classifier";
import type { ExtractedKeywords, SkillGap } from "@/types/job";
import type { SkillSet } from "@/types/resume";

function normalize(value: string): string {
    const normalized = value.trim().toLowerCase();
    const aliases: Record<string, string> = {
        "react.js": "react",
        reactjs: "react",
        "node.js": "node",
        nodejs: "node",
        js: "javascript",
        ts: "typescript",
        k8s: "kubernetes",
        pg: "postgresql",
    };
    return aliases[normalized] ?? normalized;
}

function hasSkill(target: string, skills: Set<string>): boolean {
    const normalizedTarget = normalize(target);

    if (skills.has(normalizedTarget)) {
        return true;
    }

    const threshold = normalizedTarget.length <= 5 ? 1 : 2;
    return Array.from(skills).some(
        (resumeSkill) => levenshteinDistance(normalize(resumeSkill), normalizedTarget) <= threshold
    );
}

export function detectGaps(resumeSkills: SkillSet, jdKeywords: ExtractedKeywords): SkillGap[] {
    const allResumeSkills = new Set(
        [
            ...resumeSkills.technical,
            ...resumeSkills.tools,
            ...(resumeSkills.languages ?? []),
            ...resumeSkills.soft,
            ...(resumeSkills.certifications ?? []),
        ].map(normalize)
    );

    const candidates = [
        ...jdKeywords.hardSkills.map((skill) => ({ skill, category: "critical" as const, source: "required" as const })),
        ...jdKeywords.softSkills.map((skill) => ({ skill, category: "recommended" as const, source: "preferred" as const })),
        ...jdKeywords.certifications.map((skill) => ({ skill, category: "bonus" as const, source: "preferred" as const })),
        ...jdKeywords.tools.map((skill) => ({ skill, category: "critical" as const, source: "required" as const })),
    ];

    const dedup = new Map<string, SkillGap>();

    for (const item of candidates) {
        const normalized = normalize(item.skill);
        if (hasSkill(normalized, allResumeSkills)) {
            continue;
        }

        const related = SKILL_SIMILARITY_MAP[normalized] ?? [];
        const relatedInResume = related.filter((rel) => allResumeSkills.has(normalize(rel)));

        if (!dedup.has(normalized)) {
            dedup.set(normalized, {
                skill: normalized,
                category: item.category,
                source: item.source,
                relatedSkillsInResume: relatedInResume,
                importance: item.source,
                suggestion: `Add evidence of ${normalized} in projects or skills section`,
            });
        }
    }

    return Array.from(dedup.values());
}
