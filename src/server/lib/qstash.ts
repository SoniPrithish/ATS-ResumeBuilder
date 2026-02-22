/**
 * @module server/lib/qstash
 * @description Upstash QStash client for publishing background jobs
 * and verifying webhook signatures. Used for async operations like
 * resume parsing, ATS analysis, and AI generation.
 *
 * @example
 * ```ts
 * import { publishJob, verifySignature } from "@/server/lib/qstash";
 *
 * await publishJob("resume.parse", { resumeId: "abc123" });
 * const isValid = await verifySignature(request);
 * ```
 */

import { Client, Receiver } from "@upstash/qstash";

const globalForQStash = globalThis as unknown as {
    qstashClient: Client | undefined;
    qstashReceiver: Receiver | undefined;
};

/** QStash client for publishing messages */
const qstashClient: Client =
    globalForQStash.qstashClient ??
    new Client({
        token: process.env.QSTASH_TOKEN!,
    });

/** QStash receiver for verifying webhook signatures */
const qstashReceiver: Receiver =
    globalForQStash.qstashReceiver ??
    new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    });

if (process.env.NODE_ENV !== "production") {
    globalForQStash.qstashClient = qstashClient;
    globalForQStash.qstashReceiver = qstashReceiver;
}

/** Supported job types for type-safe publishing */
export type JobType =
    | "resume.parse"
    | "resume.optimize"
    | "ats.analyze"
    | "jd.parse"
    | "ai.generate";

/**
 * Publish a background job to QStash.
 *
 * @param type - The job type identifier
 * @param payload - The job payload (will be JSON-serialized)
 * @param options - Optional configuration (delay, retries, etc.)
 * @returns The published message ID
 */
export async function publishJob<T extends Record<string, unknown>>(
    type: JobType,
    payload: T,
    options: {
        /** Delay in seconds before the job starts */
        delay?: number;
        /** Number of retries on failure */
        retries?: number;
    } = {}
): Promise<{ messageId: string }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${appUrl}/api/jobs/${type.replace(".", "/")}`;

    const result = await qstashClient.publishJSON({
        url,
        body: { type, payload, publishedAt: new Date().toISOString() },
        retries: options.retries ?? 3,
        delay: options.delay,
    });

    return { messageId: result.messageId };
}

/**
 * Verify that an incoming webhook request was signed by QStash.
 *
 * @param request - The incoming Request object
 * @returns True if the signature is valid
 */
export async function verifySignature(request: Request): Promise<{ valid: boolean; body?: string }> {
    try {
        const body = await request.text();
        const signature = request.headers.get("upstash-signature");

        if (!signature) {
            return { valid: false };
        }

        const isValid = await qstashReceiver.verify({
            body,
            signature,
        });

        return { valid: isValid, body };
    } catch (error) {
        console.error("[QStash] Signature verification failed:", error);
        return { valid: false };
    }
}
}
