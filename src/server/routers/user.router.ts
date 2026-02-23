import { z } from 'zod'
import { router, protectedProcedure } from '@/server/trpc/trpc'
import { userService } from '@/server/services/user.service'

export const userRouter = router({
    profile: protectedProcedure
        .query(({ ctx }) =>
            userService.getProfile(ctx.session.user.id)
        ),

    updateProfile: protectedProcedure
        .input(z.object({
            name: z.string().min(1).max(100).optional(),
        }))
        .mutation(({ ctx, input }) =>
            userService.updateProfile(ctx.session.user.id, input)
        ),

    setGithubRepo: protectedProcedure
        .input(z.object({
            repoUrl: z.string().url().regex(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, 'Must be a valid GitHub repository URL'),
        }))
        .mutation(({ ctx, input }) =>
            userService.setGithubRepoUrl(ctx.session.user.id, input.repoUrl)
        ),

    exportData: protectedProcedure
        .mutation(({ ctx }) =>
            userService.exportUserData(ctx.session.user.id)
        ),

    deleteAccount: protectedProcedure
        .input(z.object({
            confirmation: z.literal('DELETE MY ACCOUNT'),
        }))
        .mutation(({ ctx }) =>
            userService.deleteAccount(ctx.session.user.id)
        ),
})
