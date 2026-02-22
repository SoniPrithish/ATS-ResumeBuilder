/**
 * @module server/routers/ats.router
 * @description tRPC router for ATS scoring operations.
 */

import { z } from "zod/v4";
import { protectedProcedure, router } from "@/server/trpc/trpc";
import { atsService } from "@/server/services/ats.service";

export const atsRouter = router({
    /**
     * Score a resume for ATS compatibility.
     * Optionally accepts target keywords from a job description.
     */
    score: protectedProcedure
        .input(
            z.object({
                resumeId: z.string(),
                targetKeywords: z.array(z.string()).optional(),
            })
        )
        .mutation(({ ctx, input }) =>
            atsService.scoreResume(
                input.resumeId,
                ctx.session.user.id,
                input.targetKeywords
            )
        ),

    /**
     * Get a previously calculated ATS score.
     */
    getScore: protectedProcedure
        .input(z.object({ resumeId: z.string() }))
        .query(({ ctx, input }) =>
            atsService.getScore(input.resumeId, ctx.session.user.id)
        ),

    /**
     * Compare ATS scores across multiple resumes.
     */
    compare: protectedProcedure
        .input(
            z.object({
                resumeIds: z.array(z.string()).min(2).max(5),
            })
        )
        .query(({ ctx, input }) =>
            atsService.compareScores(input.resumeIds, ctx.session.user.id)
        ),
});
