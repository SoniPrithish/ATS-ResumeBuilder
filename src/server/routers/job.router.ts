import { z } from "zod/v4";
import { protectedProcedure, router } from "@/server/trpc/trpc";
import { TRPCError } from "@trpc/server";
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
        .mutation(async ({ ctx, input }) => {
            const result = await matcherService.saveJobDescription(ctx.session.user.id, input);
            if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            return result.data;
        }),

    list: protectedProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                pageSize: z.number().min(1).max(50).default(10),
            })
        )
        .query(async ({ ctx, input }) => {
            const result = await matcherService.getUserJobDescriptions(ctx.session.user.id, input.page, input.pageSize);
            if (!result.success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
            return result.data;
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await matcherService.getJobDescription(input.id, ctx.session.user.id);
            if (!result.success) throw new TRPCError({ code: result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR", message: result.error });
            return result.data;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const result = await matcherService.deleteJobDescription(input.id, ctx.session.user.id);
            if (!result.success) throw new TRPCError({ code: result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR", message: result.error });
            return result.data;
        }),
});
