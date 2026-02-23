import { z } from 'zod'
import { router, protectedProcedure } from '@/server/trpc/trpc'
import { versionService } from '@/server/services/version.service'
import { githubService } from '@/server/services/github.service'

export const versionRouter = router({
    create: protectedProcedure
        .input(z.object({
            resumeId: z.string(),
            changeNote: z.string().max(200).optional(),
        }))
        .mutation(({ ctx, input }) =>
            versionService.createVersion(input.resumeId, ctx.session.user.id, input.changeNote)
        ),

    list: protectedProcedure
        .input(z.object({ resumeId: z.string() }))
        .query(({ ctx, input }) =>
            versionService.getVersions(input.resumeId, ctx.session.user.id)
        ),

    get: protectedProcedure
        .input(z.object({
            resumeId: z.string(),
            version: z.number().int().positive(),
        }))
        .query(({ ctx, input }) =>
            versionService.getVersion(input.resumeId, ctx.session.user.id, input.version)
        ),

    restore: protectedProcedure
        .input(z.object({
            resumeId: z.string(),
            version: z.number().int().positive(),
        }))
        .mutation(({ ctx, input }) =>
            versionService.restoreVersion(input.resumeId, ctx.session.user.id, input.version)
        ),

    testGithub: protectedProcedure
        .query(({ ctx }) =>
            githubService.testConnection(ctx.session.user.id)
        ),
})
