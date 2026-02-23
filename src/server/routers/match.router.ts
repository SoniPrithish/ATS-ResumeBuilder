import { z } from "zod/v4";
import { protectedProcedure, router } from "@/server/trpc/trpc";
import { matcherService } from "@/server/services/matcher.service";
import { TRPCError } from "@trpc/server";

export const matchRouter = router({
    matchResumeToJD: protectedProcedure
        .input(z.object({ resumeId: z.string(), jdId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const result = await matcherService.matchResumeToJD(input.resumeId, input.jdId, ctx.session.user.id);
            if (!result.success) {
                throw new TRPCError({
                    code: result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
                    message: result.error,
                });
            }
            return result.data;
        }),

    getMatch: protectedProcedure
        .input(z.object({ resumeId: z.string(), jdId: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await matcherService.getMatch(input.resumeId, input.jdId, ctx.session.user.id);
            if (!result.success) {
                throw new TRPCError({
                    code: result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
                    message: result.error,
                });
            }
            return result.data;
        }),
});
