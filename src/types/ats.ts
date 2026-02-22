/**
 * @module types/ats
 * @description Types for ATS (Applicant Tracking System) scoring and analysis.
 */

/** Score for a single ATS category */
export interface CategoryScore {
    category: string;
    score: number;
    maxScore: number;
    feedback: string;
    suggestions: string[];
}

/** Breakdown of ATS scores by category */
export interface ATSBreakdown {
    keywords: CategoryScore;
    formatting: CategoryScore;
    experience: CategoryScore;
    education: CategoryScore;
    skills: CategoryScore;
    [key: string]: CategoryScore;
}

/** A specific suggestion for improving ATS score */
export interface ATSSuggestion {
    id: string;
    category: string;
    priority: "high" | "medium" | "low";
    message: string;
    currentText?: string;
    suggestedText?: string;
    section?: string;
}

/** Complete ATS score result */
export interface ATSScore {
    overallScore: number;
    breakdown: ATSBreakdown;
    suggestions: ATSSuggestion[];
    analyzedAt: string;
}

/** ATS analysis request */
export interface ATSAnalysisRequest {
    resumeId: string;
    jobDescriptionId?: string;
    includeDetailedFeedback?: boolean;
}

/** ATS analysis response */
export interface ATSAnalysisResponse {
    score: ATSScore;
    resumeId: string;
    jobDescriptionId?: string;
    processingTimeMs: number;
}
