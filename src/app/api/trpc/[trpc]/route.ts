/**
 * @module app/api/trpc/[trpc]/route
 * @description tRPC HTTP handler for the Next.js App Router.
 * Handles all tRPC API requests under /api/trpc/*.
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/router";
import { createContext } from "@/server/trpc/context";

/**
 * tRPC request handler using the fetch adapter.
 * Processes all incoming tRPC requests.
 */
function handler(req: Request) {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext,
        onError:
            process.env.NODE_ENV === "development"
                ? ({ path, error }) => {
                    console.error(
                        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
                    );
                }
                : undefined,
    });
}

export { handler as GET, handler as POST };
