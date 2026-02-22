/**
 * @module modules/parser/types
 * @description Internal types for the resume parser module.
 * Re-exports canonical resume types and adds parser-specific types.
 */

export type {
  CanonicalResume,
  ContactInfo,
  ExperienceEntry,
  EducationEntry,
  SkillSet,
  ProjectEntry,
  CertificationEntry,
} from "@/types/resume";

import type { CanonicalResume as _CanonicalResume } from "@/types/resume";

/** Supported resume section types */
export type ResumeSection =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "unknown";

/** A detected section within raw resume text */
export interface DetectedSection {
  /** The classified section type */
  type: ResumeSection;
  /** Line index where this section starts */
  startIndex: number;
  /** Line index where this section ends */
  endIndex: number;
  /** The raw text content between this header and the next */
  rawContent: string;
  /** The actual header line text */
  headerText: string;
}

/** Result of parsing a resume buffer */
export interface ParseResult {
  /** Whether the parse completed successfully */
  success: boolean;
  /** The parsed resume data, or null on failure */
  data: _CanonicalResume | null;
  /** Errors encountered during parsing */
  errors: string[];
  /** Non-fatal warnings */
  warnings: string[];
  /** Total parse time in milliseconds */
  parseTimeMs: number;
}
