import { levenshteinDistance } from "@/modules/matcher/skill-classifier";
import type { OverlapResult } from "@/modules/matcher/types";
import type { ExtractedKeywords } from "@/types/job";
import type { CanonicalResume } from "@/types/resume";

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function fuzzyHas(target: string, candidates: string[]): boolean {
    const normalizedTarget = normalize(target);
    return candidates.some((item) => {
        const candidate = normalize(item);
        if (candidate === normalizedTarget) {
            return true;
        }

        const threshold = normalizedTarget.length <= 5 ? 1 : 2;
        return levenshteinDistance(candidate, normalizedTarget) <= threshold;
    });
}

function containsWordBoundary(text: string, term: string): boolean {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
}

function toResumeText(resume: CanonicalResume): string {
    const projects = resume.projects?.flatMap((project) => [project.name, project.description, ...(project.highlights ?? []), ...(project.technologies ?? [])]) ?? [];
    const experience = resume.experience.flatMap((exp) => [exp.title, exp.company, ...(exp.bullets ?? []), ...(exp.technologies ?? [])]);

    return [
        resume.summary ?? "",
        ...experience,
        ...projects,
        ...resume.skills.technical,
        ...resume.skills.soft,
        ...resume.skills.tools,
        ...(resume.skills.languages ?? []),
        ...(resume.skills.certifications ?? []),
    ]
        .join(" ")
        .toLowerCase();
}

export function analyzeOverlap(
    resumeKeywords: ExtractedKeywords,
    jdKeywords: ExtractedKeywords,
    resume: CanonicalResume
): OverlapResult {
    const jdList = [
        ...jdKeywords.hardSkills.map((keyword) => ({ keyword, category: "hardSkill", importance: "required" as const })),
        ...jdKeywords.softSkills.map((keyword) => ({ keyword, category: "softSkill", importance: "preferred" as const })),
        ...jdKeywords.tools.map((keyword) => ({ keyword, category: "tool", importance: "required" as const })),
    ];

    const resumeSkills = [
        ...resume.skills.technical,
        ...resume.skills.soft,
        ...resume.skills.tools,
        ...(resume.skills.languages ?? []),
        ...(resume.skills.certifications ?? []),
    ];

    const resumeText = toResumeText(resume);
    const matched: OverlapResult["matched"] = [];
    const missing: OverlapResult["missing"] = [];

    for (const item of jdList) {
        const foundIn: Array<"skills" | "experience" | "projects" | "summary"> = [];

        if (fuzzyHas(item.keyword, resumeSkills)) {
            foundIn.push("skills");
        }

        const experienceText = resume.experience.flatMap((exp) => [exp.title, ...exp.bullets, ...(exp.technologies ?? [])]).join(" ");
        if (containsWordBoundary(experienceText.toLowerCase(), item.keyword.toLowerCase())) {
            foundIn.push("experience");
        }

        const projectText = resume.projects?.flatMap((project) => [project.name, project.description, ...(project.highlights ?? []), ...(project.technologies ?? [])]).join(" ") ?? "";
        if (containsWordBoundary(projectText.toLowerCase(), item.keyword.toLowerCase())) {
            foundIn.push("projects");
        }

        if ((resume.summary ?? "") && containsWordBoundary((resume.summary ?? "").toLowerCase(), item.keyword.toLowerCase())) {
            foundIn.push("summary");
        }

        if (foundIn.length > 0 || containsWordBoundary(resumeText, item.keyword.toLowerCase())) {
            matched.push({
                keyword: item.keyword,
                category: item.category,
                foundIn: Array.from(new Set(foundIn.length > 0 ? foundIn : ["experience"])),
            });
        } else {
            missing.push({
                keyword: item.keyword,
                category: item.category,
                importance: item.importance,
            });
        }
    }

    const jdSkillSet = new Set(jdList.map((item) => normalize(item.keyword)));
    const extra = Array.from(
        new Set(
            [
                ...resumeKeywords.hardSkills,
                ...resumeKeywords.tools,
                ...resumeKeywords.softSkills,
            ]
                .map((skill) => normalize(skill))
                .filter((skill) => !jdSkillSet.has(skill))
        )
    );

    const total = jdList.length;
    const matchPercentage = total > 0 ? (matched.length / total) * 100 : 0;

    return {
        matched,
        missing,
        extra,
        matchPercentage,
    };
}
