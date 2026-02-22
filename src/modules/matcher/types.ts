import type { SkillGap } from "@/types/job";

export interface OverlapResult {
    matched: MatchedKeyword[];
    missing: MissingKeyword[];
    extra: string[];
    matchPercentage: number;
}

export interface MatchedKeyword {
    keyword: string;
    category: string;
    foundIn: Array<"skills" | "experience" | "projects" | "summary">;
}

export interface MissingKeyword {
    keyword: string;
    category: string;
    importance: "required" | "preferred";
}

export interface SimilarityResult {
    cosineSimilarity: number;
    topSharedTerms: string[];
    uniqueToResume: string[];
    uniqueToJD: string[];
}

export interface MatchReport {
    overallScore: number;
    keywordScore: number;
    similarityScore: number;
    skillCoverageScore: number;
    experienceRelevanceScore: number;
    matchedKeywords: MatchedKeyword[];
    missingKeywords: MissingKeyword[];
    suggestions: string[];
    skillGaps: RankedSkillGap[];
}

export interface RankedSkillGap extends SkillGap {
    rank: number;
    priority: number;
    estimatedLearningTime: string;
    suggestedResources: SkillResource[];
}

export interface SkillResource {
    type: "free" | "course" | "practice";
    title: string;
    description: string;
    url?: string;
}

export interface SkillSimilarityMap {
    [skill: string]: string[];
}
