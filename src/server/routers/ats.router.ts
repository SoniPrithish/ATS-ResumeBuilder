/**
 * @module server/routers/ats.router
 * @description tRPC router for ATS scoring operations.
 */

import { z } from "zod/v4";
import { protectedProcedure, router } from "@/server/trpc/trpc";
import { TRPCError } from "@trpc/server";
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
        .mutation(async ({ ctx, input }) => {
            const result = await atsService.scoreResume(
                input.resumeId,
                ctx.session.user.id,
                input.targetKeywords
            );
            if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            return result.data;
        }),

    /**
     * Get a previously calculated ATS score.
     */
    getScore: protectedProcedure
        .input(z.object({ resumeId: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await atsService.getScore(input.resumeId, ctx.session.user.id);
            if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            return result.data;
        }),

    /**
     * Compare ATS scores across multiple resumes.
     */
    compare: protectedProcedure
        .input(
            z.object({
                resumeIds: z.array(z.string()).min(2).max(5),
            })
        )
        .query(async ({ ctx, input }) => {
            const result = await atsService.compareScores(input.resumeIds, ctx.session.user.id);
            if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            return result.data;
        }),
});
