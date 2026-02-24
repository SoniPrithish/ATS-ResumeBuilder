/**
 * @module server/lib/r2
 * @description Cloudflare R2 storage client (S3-compatible) for file uploads.
 * Supports uploading, retrieving URLs, and deleting files with
 * validation for file size and type.
 *
 * @example
 * ```ts
 * import { uploadFile, getFileUrl, deleteFile } from "@/server/lib/r2";
 *
 * const result = await uploadFile(buffer, "resume.pdf", "application/pdf");
 * const url = getFileUrl("uploads/resume.pdf");
 * await deleteFile("uploads/resume.pdf");
 * ```
 */

import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import type { ServiceResult, FileUploadMeta } from "@/types/common";

/** Maximum allowed file size: 5MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed MIME types for upload */
const ALLOWED_TYPES = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function createS3Client(): S3Client | null {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        return null;
    }

    return new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

/** S3-compatible client for Cloudflare R2 */
const s3Client = createS3Client();

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Upload a file to Cloudflare R2 storage.
 *
 * @param fileBuffer - The file content as a Buffer
 * @param fileName - Original file name
 * @param fileType - MIME type of the file
 * @returns ServiceResult with upload metadata on success
 */
export async function uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    fileType: string
): Promise<ServiceResult<FileUploadMeta>> {
    // ── Validation ─────────────────────────────────────────
    if (!ALLOWED_TYPES.has(fileType)) {
        return {
            success: false,
            error: `File type "${fileType}" is not allowed. Allowed types: PDF, DOCX`,
            code: "INVALID_FILE_TYPE",
        };
    }

    if (fileBuffer.byteLength > MAX_FILE_SIZE) {
        return {
            success: false,
            error: `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
            code: "FILE_TOO_LARGE",
        };
    }

    // ── Upload ─────────────────────────────────────────────
    if (!s3Client || !BUCKET_NAME || !PUBLIC_URL) {
        return {
            success: false,
            error: "File storage is not configured",
            code: "UPLOAD_FAILED",
        };
    }

    const extension = fileName.split(".").pop() || "bin";
    const key = `uploads/${nanoid()}.${extension}`;

    try {
        await s3Client.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: fileBuffer,
                ContentType: fileType,
                ContentDisposition: `inline; filename="${fileName}"`,
            })
        );

        return {
            success: true,
            data: {
                key,
                url: `${PUBLIC_URL}/${key}`,
                fileName,
                fileType,
                fileSize: fileBuffer.byteLength,
            },
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown upload error";
        console.error(`[R2] Upload failed for "${fileName}":`, error);
        return {
            success: false,
            error: `Failed to upload file: ${message}`,
            code: "UPLOAD_FAILED",
        };
    }
}

/**
 * Generate the public URL for a stored file.
 *
 * @param key - The storage key (e.g., "uploads/abc123.pdf")
 * @returns The public URL for the file
 */
export function getFileUrl(key: string): string {
    if (!PUBLIC_URL) {
        return "";
    }

    return `${PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from R2 storage.
 *
 * @param key - The storage key to delete
 * @returns ServiceResult indicating success or failure
 */
export async function deleteFile(
    key: string
): Promise<ServiceResult<{ key: string }>> {
    if (!s3Client || !BUCKET_NAME) {
        return {
            success: false,
            error: "File storage is not configured",
            code: "DELETE_FAILED",
        };
    }

    try {
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })
        );

        return { success: true, data: { key } };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown delete error";
        console.error(`[R2] Delete failed for key "${key}":`, error);
        return {
            success: false,
            error: `Failed to delete file: ${message}`,
            code: "DELETE_FAILED",
        };
    }
}

/**
 * Validate a file before upload without actually uploading.
 *
 * @param fileSize - Size in bytes
 * @param fileType - MIME type
 * @returns ServiceResult with validation outcome
 */
export function validateFile(
    fileSize: number,
    fileType: string
): ServiceResult<{ valid: true }> {
    if (!ALLOWED_TYPES.has(fileType)) {
        return {
            success: false,
            error: `File type "${fileType}" is not allowed. Allowed types: PDF, DOCX`,
            code: "INVALID_FILE_TYPE",
        };
    }

    if (fileSize > MAX_FILE_SIZE) {
        return {
            success: false,
            error: `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
            code: "FILE_TOO_LARGE",
        };
    }

    return { success: true, data: { valid: true } };
}
