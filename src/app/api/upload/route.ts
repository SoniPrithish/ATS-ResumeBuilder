/**
 * @module app/api/upload
 * @description File upload API endpoint for resume files.
 * Validates file type, size, and authentication before processing.
 */

import { NextResponse } from "next/server";
import { resumeService } from "@/server/services/resume.service";
import { auth } from "@/server/auth/config";

import { MAX_FILE_SIZE } from "@/lib/constants";

/** Allowed MIME types */
const ALLOWED_TYPES: Record<string, "pdf" | "docx"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

function detectFileType(file: File): "pdf" | "docx" | null {
  const mimeType = ALLOWED_TYPES[file.type];
  if (mimeType) {
    return mimeType;
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    return "pdf";
  }

  if (name.endsWith(".docx")) {
    return "docx";
  }

  return null;
}

/**
 * Handle resume file upload.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = detectFileType(file);
    if (!fileType) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only .pdf and .docx files are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit" },
        { status: 413 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload and parse
    const result = await resumeService.uploadAndParseResume(
      userId,
      file.name,
      buffer,
      fileType
    );

    if (!result.success) {
      const statusCode = result.code === "PARSE_FAILED" ? 422 : 500;
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      resumeId: (result.data as Record<string, unknown>).id,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}
