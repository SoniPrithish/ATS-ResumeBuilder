/**
 * @module types/job
 * @description Types for job description parsing, keyword extraction, and
 * resume-to-job matching operations.
 */

/** Keywords extracted from a job description */
export interface ExtractedKeywords {
    required: string[];
    preferred: string[];
    technologies: string[];
    softSkills: string[];
}

/** Experience level parsed from a job description */
export type ExperienceLevel =
    | "entry"
    | "mid"
    | "senior"
    | "lead"
    | "principal"
    | "executive";

/** A parsed and structured job description */
export interface ParsedJobDescription {
    title: string;
    company: string;
    location?: string;
    remote?: boolean;
    experienceLevel: ExperienceLevel;
    keywords: ExtractedKeywords;
    responsibilities: string[];
    qualifications: string[];
    salaryRange?: {
        min?: number;
        max?: number;
        currency?: string;
    };
}

/** A gap identified between resume skills and job requirements */
export interface SkillGap {
    skill: string;
    importance: "required" | "preferred";
    suggestion: string;
}

/** Result of matching a resume against a job description */
export interface MatchResult {
    overallScore: number;
    keywordScore: number;
    skillsScore: number;
    experienceScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    skillGaps: SkillGap[];
    suggestions: string[];
}

/** Job description database record */
export interface JobDescriptionRecord {
    id: string;
    userId: string;
    title: string;
    company: string;
    rawText: string;
    parsedData?: ParsedJobDescription;
    createdAt: Date;
    updatedAt: Date;
}
