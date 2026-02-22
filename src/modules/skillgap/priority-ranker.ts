import type { RankedSkillGap, SkillResource } from "@/modules/matcher/types";
import type { SkillGap } from "@/types/job";

const HIGH_DEMAND_SKILLS = new Set([
    "react", "python", "aws", "kubernetes", "typescript", "go", "rust", "terraform", "pytorch", "postgresql", "graphql", "node", "java", "spring", "fastapi", "django", "next.js", "azure", "gcp",
]);

const TOOL_HINTS = ["docker", "terraform", "kubernetes", "jenkins", "github actions", "ansible", "grafana", "prometheus"];
const FRAMEWORK_HINTS = ["react", "angular", "vue", "django", "flask", "spring", "next.js", "express", "fastapi"];
const LANGUAGE_HINTS = ["python", "javascript", "typescript", "go", "rust", "java", "kotlin", "ruby"];
const CERT_HINTS = ["certified", "certification", "aws sa", "azure", "gcp"];

function estimateLearningTime(skill: string): string {
    const lower = skill.toLowerCase();

    if (CERT_HINTS.some((hint) => lower.includes(hint))) {
        return "1-2 months";
    }

    if (LANGUAGE_HINTS.some((hint) => lower === hint)) {
        return "1-3 months";
    }

    if (TOOL_HINTS.some((hint) => lower.includes(hint))) {
        return "1-2 weeks";
    }

    if (FRAMEWORK_HINTS.some((hint) => lower.includes(hint))) {
        return "2-4 weeks";
    }

    return "2-4 weeks";
}

function buildResources(skill: string): SkillResource[] {
    const slug = encodeURIComponent(skill.toLowerCase().replace(/\s+/g, "-"));
    return [
        {
            type: "free",
            title: `Official ${skill} Documentation`,
            description: "Start with the official docs and getting started guide.",
        },
        {
            type: "course",
            title: `${skill} Fundamentals on Udemy`,
            description: "Structured course for beginners.",
            url: `https://udemy.com/topic/${slug}/`,
        },
        {
            type: "practice",
            title: `Build a project with ${skill}`,
            description: "Hands-on implementation project to reinforce learning.",
        },
    ];
}

export function rankGaps(gaps: SkillGap[]): RankedSkillGap[] {
    const ranked = gaps.map((gap) => {
        const categoryWeight = gap.category === "critical" ? 30 : gap.category === "recommended" ? 20 : 10;
        const demandBoost = HIGH_DEMAND_SKILLS.has(gap.skill.toLowerCase()) ? 15 : 0;
        const relatedPenalty = gap.relatedSkillsInResume.length > 0 ? -5 : 0;
        const learningBoost = TOOL_HINTS.some((hint) => gap.skill.toLowerCase().includes(hint)) ? 5 : 0;
        const priority = categoryWeight + demandBoost + relatedPenalty + learningBoost;

        return {
            ...gap,
            priority,
            rank: 0,
            estimatedLearningTime: estimateLearningTime(gap.skill),
            suggestedResources: buildResources(gap.skill),
        } satisfies RankedSkillGap;
    });

    ranked.sort((a, b) => b.priority - a.priority);

    return ranked.map((gap, index) => ({
        ...gap,
        rank: index + 1,
    }));
}
