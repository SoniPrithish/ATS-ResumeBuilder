/**
 * @module app/api/webhooks/qstash
 * @description QStash webhook handler for background job processing.
 * Verifies QStash signatures and routes jobs by type.
 */

import { NextResponse } from "next/server";
import { verifySignature } from "@/server/lib/qstash";
import { resumeService } from "@/server/services/resume.service";
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
    const isValid = await verifySignature(request);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = (await request.json()) as JobPayload;

    if (!payload.type || !payload.data) {
      return NextResponse.json(
        { success: false, error: "Invalid job payload" },
        { status: 400 }
      );
    }

    // Route by job type
    switch (payload.type) {
      case "PARSE_RESUME": {
        const { resumeId, userId } = payload.data as {
          resumeId: string;
          userId: string;
        };

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

        return NextResponse.json({ success: true });
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
