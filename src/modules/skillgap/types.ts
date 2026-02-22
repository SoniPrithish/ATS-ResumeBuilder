import type { SkillResource } from "@/modules/matcher/types";

export interface SkillRecommendation {
    skill: string;
    rank: number;
    whyItMatters: string;
    estimatedLearningTime: string;
    resources: SkillResource[];
    relatedSkillsYouHave: string[];
}
