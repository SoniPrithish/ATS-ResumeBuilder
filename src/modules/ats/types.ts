/**
 * @module modules/ats/types
 * @description Internal ATS types for the scoring engine.
 * Re-exports shared types and adds internal scoring input interfaces.
 */

export type {
    ATSScore,
    ATSBreakdown,
    CategoryScore,
    ATSSuggestion,
} from "@/types/ats";

export type { SkillSet } from "@/types/resume";

/** Input for the format compatibility scorer */
export interface FormatInput {
    /** File type: 'pdf' | 'docx' | null */
    fileType: string | null;
    /** The raw text extracted from the resume */
    rawText: string;
    /** Whether contact information was found */
    hasContactInfo: boolean;
}

/** Input for the keyword density scorer */
export interface KeywordInput {
    /** Categorized skills from the resume */
    resumeSkills: import("@/types/resume").SkillSet;
    /** The raw text of the resume */
    rawText: string;
    /** Optional target keywords from a job description */
    targetKeywords?: string[];
}

/** Input for the section completeness scorer */
export interface SectionInput {
    hasContact: boolean;
    hasSummary: boolean;
    experienceCount: number;
    experienceBulletCount: number;
    educationCount: number;
    skillCount: number;
    hasProjects: boolean;
    hasCertifications: boolean;
}

/** Input for the bullet quality scorer */
export interface BulletInput {
    /** All bullets from experience + projects */
    bullets: string[];
}

/** Input for the readability scorer */
export interface ReadabilityInput {
    /** The raw text of the resume */
    rawText: string;
    /** Total number of bullet points */
    bulletCount: number;
}

/** Configuration for ATS scoring weights */
export interface ATSScoringConfig {
    weights: {
        format: number;
        keywords: number;
        sections: number;
        bullets: number;
        readability: number;
    };
}

/** Default ATS scoring configuration — weights sum to 100 */
export const DEFAULT_ATS_CONFIG: ATSScoringConfig = {
    weights: {
        format: 15,
        keywords: 30,
        sections: 20,
        bullets: 25,
        readability: 10,
    },
};
