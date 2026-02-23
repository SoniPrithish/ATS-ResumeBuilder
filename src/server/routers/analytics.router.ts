import { z } from 'zod'
import { router, protectedProcedure } from '@/server/trpc/trpc'
import { analyticsService } from '@/server/services/analytics.service'

export const analyticsRouter = router({
    stats: protectedProcedure
        .query(({ ctx }) =>
            analyticsService.getUserStats(ctx.session.user.id)
        ),

    scoreTrend: protectedProcedure
        .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
        .query(({ ctx, input }) =>
            analyticsService.getScoreTrend(ctx.session.user.id, input.limit)
        ),

    recentActivity: protectedProcedure
        .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
        .query(({ ctx, input }) =>
            analyticsService.getRecentActivity(ctx.session.user.id, input.limit)
        ),
})
