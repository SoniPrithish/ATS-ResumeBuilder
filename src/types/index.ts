/**
 * @module types/index
 * @description Re-exports all shared types for convenient imports.
 * Usage: import type { CanonicalResume, ATSScore } from "@/types";
 */

export type {
    CanonicalResume,
    ContactInfo,
    ExperienceEntry,
    EducationEntry,
    SkillSet,
    ProjectEntry,
    CertificationEntry,
    CustomSection,
    CustomSectionEntry,
    ResumeStatus,
    ResumeRecord,
} from "./resume";

export type {
    ATSScore,
    ATSBreakdown,
    CategoryScore,
    ATSSuggestion,
    ATSAnalysisRequest,
    ATSAnalysisResponse,
} from "./ats";

export type {
    ExtractedKeywords,
    ExperienceLevel,
    ParsedJobDescription,
    SkillGap,
    MatchResult,
    JobDescriptionRecord,
} from "./job";

export type {
    AIGenerationType,
    AIOptions,
    AIUsage,
    AIResponse,
    AIProvider,
    AIGenerationRecord,
} from "./ai";

export type {
    ServiceResult,
    PaginatedResult,
    CacheConfig,
    SubscriptionTier,
    SortDirection,
    ListFilters,
    Timestamps,
    FileUploadMeta,
} from "./common";
