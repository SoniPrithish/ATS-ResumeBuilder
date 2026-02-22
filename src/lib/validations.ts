/**
 * @module lib/validations
 * @description Zod validation schemas for forms, uploads, and API inputs.
 * These schemas enforce consistent validation across client and server.
 *
 * @example
 * ```ts
 * import { resumeFormSchema, uploadSchema } from "@/lib/validations";
 *
 * const result = resumeFormSchema.safeParse(formData);
 * if (!result.success) {
 *   console.log(result.error.flatten());
 * }
 * ```
 */

import { z } from "zod";
import {
    MAX_RESUME_TITLE_LENGTH,
    MAX_JD_LENGTH,
    MAX_FILE_SIZE,
    MAX_EXPERIENCE_ENTRIES,
    MAX_EDUCATION_ENTRIES,
    MAX_PROJECT_ENTRIES,
    MAX_BULLETS_PER_EXPERIENCE,
} from "./constants";

// ── Contact Info Schema ────────────────────────────────────

export const contactInfoSchema = z.object({
    fullName: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().max(20).optional(),
    location: z.string().max(100).optional(),
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    portfolio: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
});

// ── Experience Schema ──────────────────────────────────────

export const experienceSchema = z.object({
    id: z.string(),
    company: z.string().min(1, "Company name is required").max(100),
    title: z.string().min(1, "Job title is required").max(100),
    location: z.string().max(100).optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    current: z.boolean(),
    bullets: z
        .array(z.string().min(1).max(500))
        .max(MAX_BULLETS_PER_EXPERIENCE, `Maximum ${MAX_BULLETS_PER_EXPERIENCE} bullet points`),
    technologies: z.array(z.string().max(50)).optional(),
});

// ── Education Schema ───────────────────────────────────────

export const educationSchema = z.object({
    id: z.string(),
    institution: z.string().min(1, "Institution is required").max(100),
    degree: z.string().min(1, "Degree is required").max(100),
    field: z.string().min(1, "Field of study is required").max(100),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    gpa: z.string().max(10).optional(),
    honors: z.array(z.string().max(100)).optional(),
    coursework: z.array(z.string().max(100)).optional(),
});

// ── Skills Schema ──────────────────────────────────────────

export const skillSetSchema = z.object({
    technical: z.array(z.string().max(50)),
    soft: z.array(z.string().max(50)),
    tools: z.array(z.string().max(50)),
    languages: z.array(z.string().max(50)).optional(),
    certifications: z.array(z.string().max(100)).optional(),
});

// ── Project Schema ─────────────────────────────────────────

export const projectSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Project name is required").max(100),
    description: z.string().min(1, "Description is required").max(500),
    url: z.string().url("Invalid URL").optional().or(z.literal("")),
    technologies: z.array(z.string().max(50)),
    highlights: z.array(z.string().max(200)).optional(),
});

// ── Certification Schema ───────────────────────────────────

export const certificationSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Certification name is required").max(150),
    issuer: z.string().min(1, "Issuer is required").max(100),
    date: z.string().min(1, "Date is required"),
    expirationDate: z.string().optional(),
    credentialId: z.string().max(100).optional(),
    url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// ── Resume Form Schema ─────────────────────────────────────

export const resumeFormSchema = z.object({
    title: z
        .string()
        .min(1, "Resume title is required")
        .max(MAX_RESUME_TITLE_LENGTH, `Maximum ${MAX_RESUME_TITLE_LENGTH} characters`),
    contactInfo: contactInfoSchema,
    summary: z.string().max(2000, "Summary is too long").optional(),
    experience: z
        .array(experienceSchema)
        .max(MAX_EXPERIENCE_ENTRIES, `Maximum ${MAX_EXPERIENCE_ENTRIES} entries`),
    education: z
        .array(educationSchema)
        .max(MAX_EDUCATION_ENTRIES, `Maximum ${MAX_EDUCATION_ENTRIES} entries`),
    skills: skillSetSchema,
    projects: z
        .array(projectSchema)
        .max(MAX_PROJECT_ENTRIES, `Maximum ${MAX_PROJECT_ENTRIES} entries`)
        .optional(),
    certifications: z.array(certificationSchema).optional(),
});

// ── Job Description Form Schema ────────────────────────────

export const jdFormSchema = z.object({
    title: z.string().min(1, "Job title is required").max(200),
    company: z.string().min(1, "Company name is required").max(100),
    rawText: z
        .string()
        .min(50, "Job description must be at least 50 characters")
        .max(MAX_JD_LENGTH, `Maximum ${MAX_JD_LENGTH} characters`),
});

// ── Upload Schema ──────────────────────────────────────────

export const uploadSchema = z.object({
    fileName: z.string().min(1, "File name is required"),
    fileType: z.enum([
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ] as [string, ...string[]], "Only PDF and DOCX files are allowed"),
    fileSize: z
        .number()
        .positive("File size must be positive")
        .max(MAX_FILE_SIZE, `File must be under ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
});

// ── Login Schema ───────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    callbackUrl: z.string().url().optional(),
});

// ── Inferred Types ─────────────────────────────────────────

export type ResumeFormValues = z.infer<typeof resumeFormSchema>;
export type JDFormValues = z.infer<typeof jdFormSchema>;
export type UploadValues = z.infer<typeof uploadSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
