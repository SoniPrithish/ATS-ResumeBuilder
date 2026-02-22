/**
 * @module lib/constants
 * @description Application-wide constants and default configurations.
 */

/** Application name */
export const APP_NAME = "TechResume AI";

/** Application description for SEO */
export const APP_DESCRIPTION =
    "Free AI-powered resume optimization tool. Build ATS-friendly resumes, get instant feedback, and match your resume to job descriptions.";

/** Base URL (resolved at runtime) */
export const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ── Limits ─────────────────────────────────────────────────

/** Maximum file upload size in bytes (5MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Maximum number of resumes per free user */
export const MAX_RESUMES_FREE = 5;

/** Maximum number of resumes per pro user */
export const MAX_RESUMES_PRO = 50;

/** Maximum number of job descriptions per free user */
export const MAX_JOB_DESCRIPTIONS_FREE = 10;

/** Maximum number of AI generations per day (free tier) */
export const MAX_AI_GENERATIONS_FREE = 20;

/** Maximum resume title length */
export const MAX_RESUME_TITLE_LENGTH = 100;

/** Maximum job description length in characters */
export const MAX_JD_LENGTH = 10000;

/** Maximum number of experience entries */
export const MAX_EXPERIENCE_ENTRIES = 20;

/** Maximum number of education entries */
export const MAX_EDUCATION_ENTRIES = 10;

/** Maximum number of project entries */
export const MAX_PROJECT_ENTRIES = 15;

/** Maximum number of bullet points per experience */
export const MAX_BULLETS_PER_EXPERIENCE = 10;

// ── File Types ─────────────────────────────────────────────

/** Allowed MIME types for resume upload */
export const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/** Human-readable file type labels */
export const FILE_TYPE_LABELS: Record<string, string> = {
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCX",
};

// ── Cache TTLs (seconds) ───────────────────────────────────

/** Cache TTL for ATS score results */
export const CACHE_TTL_ATS_SCORE = 60 * 60; // 1 hour

/** Cache TTL for parsed job descriptions */
export const CACHE_TTL_JD_PARSE = 60 * 60 * 24; // 24 hours

/** Cache TTL for AI generation results */
export const CACHE_TTL_AI_GENERATION = 60 * 30; // 30 minutes

/** Cache TTL for user session data */
export const CACHE_TTL_SESSION = 60 * 5; // 5 minutes

// ── Pagination Defaults ────────────────────────────────────

/** Default page size for list queries */
export const DEFAULT_PAGE_SIZE = 10;

/** Maximum allowed page size */
export const MAX_PAGE_SIZE = 50;

// ── AI Model Defaults ──────────────────────────────────────

/** Default AI model */
export const DEFAULT_AI_MODEL = "gemini-2.0-flash";

/** Default temperature for AI generation */
export const DEFAULT_AI_TEMPERATURE = 0.7;

/** Default max tokens for AI generation */
export const DEFAULT_AI_MAX_TOKENS = 4096;
