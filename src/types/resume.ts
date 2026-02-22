/**
 * @module types/resume
 * @description Canonical resume types representing the normalized data model
 * for all resume operations — parsing, editing, rendering, and ATS analysis.
 */

/** Contact information for the resume header */
export interface ContactInfo {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    portfolio?: string;
}

/** A single work experience entry */
export interface ExperienceEntry {
    id: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
    technologies?: string[];
}

/** A single education entry */
export interface EducationEntry {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    honors?: string[];
    coursework?: string[];
}

/** Categorized skill set */
export interface SkillSet {
    technical: string[];
    soft: string[];
    tools: string[];
    languages?: string[];
    certifications?: string[];
}

/** A project entry */
export interface ProjectEntry {
    id: string;
    name: string;
    description: string;
    url?: string;
    technologies: string[];
    highlights?: string[];
}

/** A certification or license */
export interface CertificationEntry {
    id: string;
    name: string;
    issuer: string;
    date: string;
    expirationDate?: string;
    credentialId?: string;
    url?: string;
}

/** A user-defined custom section */
export interface CustomSection {
    id: string;
    title: string;
    entries: CustomSectionEntry[];
}

/** An entry within a custom section */
export interface CustomSectionEntry {
    id: string;
    title?: string;
    subtitle?: string;
    date?: string;
    description?: string;
    bullets?: string[];
}

/**
 * The canonical resume data structure.
 * All resume operations (parse, edit, render, analyze) operate on this shape.
 */
export interface CanonicalResume {
    contactInfo: ContactInfo;
    summary?: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: SkillSet;
    projects?: ProjectEntry[];
    certifications?: CertificationEntry[];
    customSections?: CustomSection[];
}

/** Resume status enum matching Prisma schema */
export type ResumeStatus = "DRAFT" | "COMPLETE" | "ARCHIVED";

/** Resume metadata from the database record */
export interface ResumeRecord {
    id: string;
    userId: string;
    title: string;
    status: ResumeStatus;
    templateId?: string;
    contactInfo: ContactInfo;
    summary?: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: SkillSet;
    projects?: ProjectEntry[];
    certifications?: CertificationEntry[];
    customSections?: CustomSection[];
    rawText?: string;
    originalFileUrl?: string;
    originalFileName?: string;
    originalFileType?: string;
    lastAtsScore?: number;
    lastAtsDetails?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
