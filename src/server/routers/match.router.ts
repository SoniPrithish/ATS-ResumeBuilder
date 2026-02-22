import { z } from "zod/v4";
import { protectedProcedure, router } from "@/server/trpc/trpc";
import { matcherService } from "@/server/services/matcher.service";

export const matchRouter = router({
    matchResumeToJD: protectedProcedure
        .input(z.object({ resumeId: z.string(), jdId: z.string() }))
        .mutation(({ ctx, input }) =>
            matcherService.matchResumeToJD(input.resumeId, input.jdId, ctx.session.user.id)
        ),

    getMatch: protectedProcedure
        .input(z.object({ resumeId: z.string(), jdId: z.string() }))
        .query(({ ctx, input }) =>
            matcherService.getMatch(input.resumeId, input.jdId, ctx.session.user.id)
        ),
});
