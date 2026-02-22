/**
 * @module server/trpc/context
 * @description tRPC context factory. Creates context with the database client,
 * Redis client, session, and request metadata for every tRPC call.
 */

import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth } from "@/server/auth/config";
import { db } from "@/server/lib/db";
import { redis } from "@/server/lib/redis";

/**
 * Inner context creation — does not depend on the request.
 * Useful for testing and server-side calls.
 */
export function createInnerContext() {
    return {
        db,
        redis,
    };
}

/**
 * Create the full tRPC context for each request.
 * Includes session, database, and Redis clients.
 */
export async function createContext(opts?: FetchCreateContextFnOptions) {
    const session = await auth();

    return {
        ...createInnerContext(),
        session,
        headers: opts?.req.headers,
    };
}

/** The context type used by tRPC procedures */
export type Context = Awaited<ReturnType<typeof createContext>>;
