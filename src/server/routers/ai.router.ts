import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { aiService } from "@/server/services/ai.service";
import { protectedProcedure, router } from "@/server/trpc/trpc";

const summaryInputSchema = z.object({
  resumeData: z.object({
    title: z.string().optional(),
    experience: z.array(z.unknown()).optional(),
    skills: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const aiRouter = router({
  enhanceBullet: protectedProcedure
    .input(
      z.object({
        bullet: z.string().min(5).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await aiService.enhanceBullet(ctx.session.user.id, input);
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  generateSummary: protectedProcedure
    .input(summaryInputSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await aiService.generateSummary(ctx.session.user.id, input);
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),

  tailorResume: protectedProcedure
    .input(
      z.object({
        resumeId: z.string(),
        jobId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await aiService.tailorResume(ctx.session.user.id, input);
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }
      return result.data;
    }),
});
