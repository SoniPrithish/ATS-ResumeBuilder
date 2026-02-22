/**
 * @module app/api/webhooks/qstash
 * @description QStash webhook handler for background job processing.
 * Verifies QStash signatures and routes jobs by type.
 */

import { NextResponse } from "next/server";
import { verifySignature } from "@/server/lib/qstash";
import { resumeService } from "@/server/services/resume.service";
import { storageService } from "@/server/services/storage.service";
import { parseResume } from "@/modules/parser";
import { createChildLogger } from "@/server/lib/logger";

const log = createChildLogger("qstash-webhook");

/** Job payload structure */
interface JobPayload {
  type: string;
  data: Record<string, unknown>;
}

/**
 * Handle QStash webhook callbacks.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Verify QStash signature
    const sig = await verifySignature(request);
    if (!sig.valid || !sig.body) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse payload
    let payload: JobPayload;
    try {
      payload = JSON.parse(sig.body) as JobPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!payload.type || !payload.data) {
      return NextResponse.json(
        { success: false, error: "Invalid job payload" },
        { status: 400 }
      );
    }

    // Route by job type
    switch (payload.type) {
      case "PARSE_RESUME": {
        const { resumeId, userId, fileKey, fileType } = payload.data as {
          resumeId: string;
          userId: string;
          fileKey?: string;
          fileType?: "pdf" | "docx";
        };

        if (!resumeId || typeof resumeId !== "string" ||
          !userId || typeof userId !== "string") {
          return NextResponse.json(
            { success: false, error: "Missing resumeId or userId" },
            { status: 400 }
          );
        }

        // Idempotency: check if already parsed
        const existing = await resumeService.getResume(resumeId, userId);
        if (
          existing.success &&
          (existing.data as Record<string, unknown>).rawText
        ) {
          log.info({ resumeId }, "Resume already parsed, skipping");
          return NextResponse.json({ success: true, skipped: true });
        }

        log.info({ resumeId, userId }, "Processing PARSE_RESUME job");

        // Fallback to storing information if not in payload 
        const existingData = existing.success && "data" in existing ? (existing.data as Record<string, unknown>) : null;
        const effectiveFileKey = fileKey || existingData?.originalFileUrl as string;
        const effectiveFileType = fileType || existingData?.originalFileType as "pdf" | "docx";

        if (!effectiveFileKey || !effectiveFileType) {
          log.error({ resumeId }, "Missing required file storage keys for parsing flow");
          return NextResponse.json({ success: false, error: "Missing file information" }, { status: 400 });
        }

        // 1. Fetch from storage
        const fileResult = await storageService.getResumeFile(effectiveFileKey);
        if (!fileResult.success || !fileResult.data) {
          log.error({ effectiveFileKey }, "Failed to fetch file from storage");
          return NextResponse.json({ success: false, error: "Storage fetch failed" }, { status: 500 });
        }

        // 2. Parse file using orchestrator
        const parseResult = await parseResume(fileResult.data, effectiveFileType);
        if (!parseResult.success || !parseResult.data) {
          log.error({ resumeId, errors: parseResult.errors }, "Parsing failed");
          return NextResponse.json({ success: false, error: `Parsing failed: ${parseResult.errors.join(", ")}` }, { status: 500 });
        }

        // 3. Assemble and persist the parsed output
        const updateData = {
          status: "COMPLETE" as const,
          rawText: parseResult.rawText || existingData?.originalFileName as string || "Parsed Resume",
          title: parseResult.data.contactInfo.fullName ? `${parseResult.data.contactInfo.fullName}'s Resume` : "Uploaded Resume",
          contactInfo: parseResult.data.contactInfo as unknown as Record<string, unknown>,
          summary: parseResult.data.summary,
          experience: parseResult.data.experience as unknown as Record<string, unknown>[],
          education: parseResult.data.education as unknown as Record<string, unknown>[],
          skills: parseResult.data.skills as unknown as Record<string, unknown>,
          projects: parseResult.data.projects as unknown as Record<string, unknown>[],
          certifications: parseResult.data.certifications as unknown as Record<string, unknown>[],
        };

        const updateResult = await resumeService.updateResume(resumeId, userId, updateData);
        if (!updateResult.success) {
          log.error({ resumeId, err: updateResult.error }, "Failed to save parsed resume");
          return NextResponse.json({ success: false, error: "Save failed" }, { status: 500 });
        }

        return NextResponse.json({ success: true, processed: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown job type: ${payload.type}` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    log.error({ error: message }, "Webhook handler failed");
    return NextResponse.json(
      { success: false, error: `Webhook failed: ${message}` },
      { status: 500 }
    );
  }
}
