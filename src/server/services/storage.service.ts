/**
 * @module server/services/storage.service
 * @description Storage service for resume file operations using Cloudflare R2.
 * Provides upload, get, and delete operations with validation.
 */

import {
  uploadFile,
  getFileUrl,
  deleteFile,
} from "@/server/lib/r2";
import { createChildLogger } from "@/server/lib/logger";
import type { ServiceResult } from "@/types/common";

const log = createChildLogger("storage-service");

/** Maximum file size: 5MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed content types */
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/**
 * Storage service for resume file operations.
 */
export const storageService = {
  /**
   * Upload a resume file to R2 storage.
   *
   * @param userId - The user ID
   * @param resumeId - The resume ID
   * @param fileName - Original file name
   * @param buffer - The file buffer
   * @param contentType - MIME type of the file
   * @returns ServiceResult with URL and key on success
   */
  async uploadResume(
    userId: string,
    resumeId: string,
    fileName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<ServiceResult<{ url: string; key: string }>> {
    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return {
        success: false,
        error: `Invalid content type: ${contentType}. Only PDF and DOCX files are allowed.`,
        code: "INVALID_CONTENT_TYPE",
      };
    }

    // Validate file size
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds 5MB limit`,
        code: "FILE_TOO_LARGE",
      };
    }

    try {
      const result = await uploadFile(buffer, fileName, contentType);

      if (!result.success) {
        return result as ServiceResult<{ url: string; key: string }>;
      }

      log.info({ userId, resumeId, key: result.data.key }, "Resume file uploaded");

      return {
        success: true,
        data: {
          url: result.data.url,
          key: result.data.key,
        },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown upload error";
      log.error({ userId, resumeId, error: message }, "Upload failed");
      return {
        success: false,
        error: `Upload failed: ${message}`,
        code: "UPLOAD_FAILED",
      };
    }
  },

  /**
   * Get a resume file from R2 storage.
   *
   * @param key - The storage key
   * @returns ServiceResult with the file buffer
   */
  async getResumeFile(key: string): Promise<ServiceResult<Buffer>> {
    try {
      const url = getFileUrl(key);
      log.info({ key }, "Resume file URL retrieved");

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch file (status ${res.status})`);
      }
      const bytes = await res.arrayBuffer();
      return {
        success: true,
        data: Buffer.from(bytes),
      };
    } catch (err) {
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error({ key, error: message }, "Failed to get resume file");
      return {
        success: false,
        error: `Failed to get file: ${message}`,
        code: "GET_FAILED",
      };
    }
  },

  /**
   * Delete a resume file from R2 storage.
   *
   * @param key - The storage key
   * @returns ServiceResult indicating success or failure
   */
  async deleteResumeFile(key: string): Promise<ServiceResult<void>> {
    try {
      const result = await deleteFile(key);

      if (!result.success) {
        return { success: false, error: result.error, code: "DELETE_FAILED" };
      }

      log.info({ key }, "Resume file deleted");
      return { success: true, data: undefined };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      log.error({ key, error: message }, "Failed to delete resume file");
      return {
        success: false,
        error: `Failed to delete file: ${message}`,
        code: "DELETE_FAILED",
      };
    }
  },
};
