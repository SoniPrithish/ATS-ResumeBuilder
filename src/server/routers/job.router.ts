import { z } from "zod/v4";
import { protectedProcedure, router } from "@/server/trpc/trpc";
import { matcherService } from "@/server/services/matcher.service";

export const jobRouter = router({
    create: protectedProcedure
        .input(
            z.object({
                title: z.string().min(1).max(200),
                company: z.string().max(200).optional(),
                rawText: z.string().min(50).max(20000),
            })
        )
        .mutation(({ ctx, input }) => matcherService.saveJobDescription(ctx.session.user.id, input)),

    list: protectedProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                pageSize: z.number().min(1).max(50).default(10),
            })
        )
        .query(({ ctx, input }) =>
            matcherService.getUserJobDescriptions(ctx.session.user.id, input.page, input.pageSize)
        ),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => matcherService.getJobDescription(input.id, ctx.session.user.id)),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => matcherService.deleteJobDescription(input.id, ctx.session.user.id)),
});
