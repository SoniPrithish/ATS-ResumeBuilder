import { router } from "./trpc";
import { resumeRouter } from "@/server/routers/resume.router";
import { atsRouter } from "@/server/routers/ats.router";
import { aiRouter } from "@/server/routers/ai.router";
import { matchRouter } from "@/server/routers/match.router";
import { jobRouter } from "@/server/routers/job.router";
import { versionRouter } from "@/server/routers/version.router";
import { analyticsRouter } from "@/server/routers/analytics.router";
import { userRouter } from "@/server/routers/user.router";

export const appRouter = router({
  resume: resumeRouter,
  ats: atsRouter,
  ai: aiRouter,
  match: matchRouter,
  job: jobRouter,
  version: versionRouter,
  analytics: analyticsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
