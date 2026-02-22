/**
 * @module server/trpc/router
 * @description Root tRPC router that merges all sub-routers.
 * Other agents will add their routers here as they build features.
 *
 * @example
 * ```ts
 * import type { AppRouter } from "@/server/trpc/router";
 * ```
 */

import { router } from "./trpc";
import { resumeRouter } from "@/server/routers/resume.router";

/**
 * Root application router.
 * Sub-routers will be added by other agents:
 * - resumeRouter (Agent 1) ✓
 * - parserRouter (Agent 2)
 * - atsRouter (Agent 3)
 * - aiRouter (Agent 4)
 * - dashboardRouter (Agent 5)
 * - exportRouter (Agent 6)
 */
export const appRouter = router({
    resume: resumeRouter,
});

/** Type definition for the root router (used by tRPC client) */
export type AppRouter = typeof appRouter;
