/**
 * @module server/trpc/trpc
 * @description tRPC initialization with base and authenticated procedures.
 * Sets up the tRPC instance, superjson transformer, and middleware.
 *
 * @example
 * ```ts
 * import { publicProcedure, protectedProcedure, router } from "@/server/trpc/trpc";
 *
 * export const myRouter = router({
 *   public: publicProcedure.query(() => "hello"),
 *   protected: protectedProcedure.query(({ ctx }) => ctx.session.user),
 * });
 * ```
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

/**
 * tRPC instance with superjson transformer for rich type serialization
 * (Date, Map, Set, BigInt, etc.)
 */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    },
});

/** Create a new tRPC router */
export const router = t.router;

/** Middleware for logging/timing (applied to all procedures) */
const timingMiddleware = t.middleware(async ({ path, type, next }) => {
    const start = performance.now();
    const result = await next();
    const durationMs = Math.round(performance.now() - start);

    if (durationMs > 500) {
        console.warn(`[tRPC] Slow ${type} "${path}": ${durationMs}ms`);
    }

    return result;
});

/** Public procedure — no authentication required */
export const publicProcedure = t.procedure.use(timingMiddleware);

/** Auth middleware — ensures the user is authenticated */
const enforceAuth = t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user?.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be signed in to perform this action",
        });
    }

    return next({
        ctx: {
            ...ctx,
            // Safely narrow the session type
            session: {
                ...ctx.session,
                user: ctx.session.user as {
                    id: string;
                    name?: string | null;
                    email?: string | null;
                    image?: string | null;
                },
            },
        },
    });
});

/** Protected procedure — requires authentication */
export const protectedProcedure = t.procedure
    .use(timingMiddleware)
    .use(enforceAuth);
