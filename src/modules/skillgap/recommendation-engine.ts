import type { RankedSkillGap, SkillResource } from "@/modules/matcher/types";
import type { SkillRecommendation } from "@/modules/skillgap/types";

function whyItMatters(category: RankedSkillGap["category"]): string {
    if (category === "critical") {
        return "This is a required skill for this role. Missing it may cause your resume to be filtered by ATS systems.";
    }

    if (category === "recommended") {
        return "This is a preferred qualification. Having it would significantly strengthen your application.";
    }

    return "This is a nice-to-have that could differentiate you from other candidates.";
}

function practiceDescription(skill: string): string {
    const lower = skill.toLowerCase();

    if (["react", "angular", "vue", "next.js", "django", "spring", "express"].some((item) => lower.includes(item))) {
        return "Hands-on project idea: Build a CRUD app with authentication";
    }

    if (["aws", "azure", "gcp", "cloud"].some((item) => lower.includes(item))) {
        return `Hands-on project idea: Deploy a serverless API on ${skill}`;
    }

    if (["postgresql", "mysql", "mongodb", "redis", "database"].some((item) => lower.includes(item))) {
        return "Hands-on project idea: Model and query a real-world dataset";
    }

    if (["docker", "kubernetes", "terraform", "devops", "ci/cd"].some((item) => lower.includes(item))) {
        return "Hands-on project idea: Containerize an existing project and set up CI/CD";
    }

    if (["python", "go", "rust", "java", "typescript", "javascript"].some((item) => lower === item)) {
        return `Hands-on project idea: Solve 20 problems on LeetCode using ${skill}`;
    }

    return "Hands-on project idea: Build a small end-to-end project showcasing this skill";
}

function resources(skill: string): SkillResource[] {
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
            description: practiceDescription(skill),
        },
    ];
}

export function generateRecommendations(gaps: RankedSkillGap[]): SkillRecommendation[] {
    return gaps.slice(0, 10).map((gap) => ({
        skill: gap.skill,
        rank: gap.rank,
        whyItMatters: whyItMatters(gap.category),
        estimatedLearningTime: gap.estimatedLearningTime,
        resources: resources(gap.skill),
        relatedSkillsYouHave: gap.relatedSkillsInResume,
    }));
}
