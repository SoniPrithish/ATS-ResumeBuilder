/**
 * @module server/services/resume.service
 * @description Resume service providing CRUD operations and the upload+parse pipeline.
 * All methods check userId ownership. Soft-deletes via ARCHIVED status.
 */

import { db } from "@/server/lib/db";
import { createChildLogger } from "@/server/lib/logger";
import { parseResume } from "@/modules/parser";
import type { ServiceResult, PaginatedResult } from "@/types/common";

const log = createChildLogger("resume-service");

/** Input for creating a resume */
export interface CreateResumeInput {
  title: string;
  contactInfo?: Record<string, unknown>;
  summary?: string;
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  skills?: Record<string, unknown>;
  projects?: Record<string, unknown>[];
  certifications?: Record<string, unknown>[];
  rawText?: string;
  originalFileUrl?: string;
  originalFileName?: string;
  originalFileType?: string;
}

/** Input for updating a resume */
export interface UpdateResumeInput {
  title?: string;
  templateId?: string;
  status?: "DRAFT" | "COMPLETE" | "ARCHIVED";
  contactInfo?: Record<string, unknown>;
  summary?: string;
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  skills?: Record<string, unknown>;
  projects?: Record<string, unknown>[];
  certifications?: Record<string, unknown>[];
  customSections?: Record<string, unknown>[];
}

/** Pagination options */
export interface PaginationOpts {
  page: number;
  pageSize: number;
  status?: "DRAFT" | "COMPLETE" | "ARCHIVED";
}

/** Resume record type from Prisma */
type Resume = Record<string, unknown>;

/**
 * Resume service with CRUD operations and upload+parse pipeline.
 */
export const resumeService = {
  /**
   * Create a new resume for a user.
   */
  async createResume(
    userId: string,
    data: CreateResumeInput
  ): Promise<ServiceResult<Resume>> {
    try {
      const resume = await db.resume.create({
        data: {
          userId,
          title: data.title,
          status: "DRAFT",
          contactInfo: (data.contactInfo ?? {}) as never,
          summary: data.summary,
          experience: (data.experience ?? []) as never,
          education: (data.education ?? []) as never,
          skills: (data.skills ?? {}) as never,
          projects: (data.projects ?? []) as never,
          certifications: (data.certifications ?? []) as never,
          rawText: data.rawText,
          originalFileUrl: data.originalFileUrl,
          originalFileName: data.originalFileName,
          originalFileType: data.originalFileType,
        },
      });

      log.info({ userId, resumeId: resume.id }, "Resume created");
      return { success: true, data: resume as unknown as Resume };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error({ userId, error: message }, "Failed to create resume");
      return {
        success: false,
        error: `Failed to create resume: ${message}`,
        code: "CREATE_FAILED",
      };
    }
  },

  /**
   * Get a resume by ID, checking ownership.
   */
  async getResume(
    id: string,
    userId: string
  ): Promise<ServiceResult<Resume>> {
    try {
      const resume = await db.resume.findUnique({ where: { id } });

      if (!resume) {
        return {
          success: false,
          error: "Resume not found",
          code: "NOT_FOUND",
        };
      }

      if ((resume as Record<string, unknown>).userId !== userId) {
        return {
          success: false,
          error: "Resume not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: resume as unknown as Resume };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error({ id, userId, error: message }, "Failed to get resume");
      return {
        success: false,
        error: `Failed to get resume: ${message}`,
        code: "GET_FAILED",
      };
    }
  },

  /**
   * Get paginated resumes for a user.
   */
  async getUserResumes(
    userId: string,
    opts: PaginationOpts
  ): Promise<ServiceResult<PaginatedResult<Resume>>> {
    try {
      const where: Record<string, unknown> = { userId };
      if (opts.status) {
        where.status = opts.status;
      }

      const [items, total] = await Promise.all([
        db.resume.findMany({
          where,
          skip: (opts.page - 1) * opts.pageSize,
          take: opts.pageSize,
          orderBy: { updatedAt: "desc" },
        }),
        db.resume.count({ where }),
      ]);

      const totalPages = Math.ceil(total / opts.pageSize);

      return {
        success: true,
        data: {
          items: items as unknown as Resume[],
          total,
          page: opts.page,
          pageSize: opts.pageSize,
          totalPages,
          hasMore: opts.page < totalPages,
        },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error({ userId, error: message }, "Failed to list resumes");
      return {
        success: false,
        error: `Failed to list resumes: ${message}`,
        code: "LIST_FAILED",
      };
    }
  },

  /**
   * Update a resume, checking ownership.
   */
  async updateResume(
    id: string,
    userId: string,
    data: UpdateResumeInput
  ): Promise<ServiceResult<Resume>> {
    try {
      const existing = await db.resume.findUnique({ where: { id } });

      if (!existing) {
        return {
          success: false,
          error: "Resume not found",
          code: "NOT_FOUND",
        };
      }

      if ((existing as Record<string, unknown>).userId !== userId) {
        return {
          success: false,
          error: "Resume not found",
          code: "NOT_FOUND",
        };
      }

      const resume = await db.resume.update({
        where: { id },
        data: data as never,
      });

      log.info({ id, userId }, "Resume updated");
      return { success: true, data: resume as unknown as Resume };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error({ id, userId, error: message }, "Failed to update resume");
      return {
        success: false,
        error: `Failed to update resume: ${message}`,
        code: "UPDATE_FAILED",
      };
    }
  },

  /**
   * Soft-delete a resume by setting status to ARCHIVED.
   */
  async deleteResume(
    id: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      const existing = await db.resume.findUnique({ where: { id } });

      if (!existing) {
        return {
          success: false,
          error: "Resume not found",
          code: "NOT_FOUND",
        };
      }

      if ((existing as Record<string, unknown>).userId !== userId) {
        return {
          success: false,
          error: "Resume not found",
          code: "NOT_FOUND",
        };
      }

      await db.resume.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      log.info({ id, userId }, "Resume archived");
      return { success: true, data: undefined };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error({ id, userId, error: message }, "Failed to delete resume");
      return {
        success: false,
        error: `Failed to delete resume: ${message}`,
        code: "DELETE_FAILED",
      };
    }
  },

  /**
   * Upload a file, parse it, and create a resume record.
   */
  async uploadAndParseResume(
    userId: string,
    fileName: string,
    buffer: Buffer,
    fileType: "pdf" | "docx"
  ): Promise<ServiceResult<Resume>> {
    try {
      // Parse the resume
      const parseResult = await parseResume(buffer, fileType);

      if (!parseResult.success || !parseResult.data) {
        const parseErrors = parseResult.errors.join(", ") || "Unknown parse error";
        return {
          success: false,
          error:
            `We couldn't parse this resume automatically. ${parseErrors}. ` +
            "Please try another PDF/DOCX export or create a new resume manually.",
          code: "PARSE_FAILED",
        };
      }

      // Create resume record with parsed data
      const data = parseResult.data;
      const result = await resumeService.createResume(userId, {
        title: data.contactInfo.fullName
          ? `${data.contactInfo.fullName}'s Resume`
          : "Uploaded Resume",
        contactInfo: data.contactInfo as unknown as Record<string, unknown>,
        summary: data.summary,
        experience: data.experience as unknown as Record<string, unknown>[],
        education: data.education as unknown as Record<string, unknown>[],
        skills: data.skills as unknown as Record<string, unknown>,
        projects: data.projects as unknown as Record<string, unknown>[],
        certifications: data.certifications as unknown as Record<
          string,
          unknown
        >[],
        originalFileName: fileName,
        originalFileType: fileType,
      });

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error(
        { userId, fileName, error: message },
        "Failed to upload and parse resume"
      );
      return {
        success: false,
        error: `Upload and parse failed: ${message}`,
        code: "UPLOAD_PARSE_FAILED",
      };
    }
  },
};
