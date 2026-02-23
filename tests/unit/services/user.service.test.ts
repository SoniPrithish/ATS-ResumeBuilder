import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from '@/server/services/user.service'
import { storageService } from '@/server/services/storage.service'
import { cacheService } from '@/server/services/cache.service'
import { db } from '@/server/lib/db'

vi.mock('@/server/lib/db', () => ({
    db: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        resume: {
            findMany: vi.fn(),
            deleteMany: vi.fn(),
        },
        jobDescription: { findMany: vi.fn(), deleteMany: vi.fn() },
        matchResult: { findMany: vi.fn(), deleteMany: vi.fn() },
        aIGeneration: { findMany: vi.fn(), deleteMany: vi.fn() },
        analyticsEvent: { findMany: vi.fn(), deleteMany: vi.fn() },
        resumeVersion: { deleteMany: vi.fn() },
        session: { deleteMany: vi.fn() },
        account: { deleteMany: vi.fn() },
        $transaction: vi.fn(),
    },
}))

vi.mock('@/server/services/storage.service', () => ({
    storageService: {
        deleteResumeFile: vi.fn(),
    },
}))

vi.mock('@/server/services/cache.service', () => ({
    cacheService: {
        invalidate: vi.fn(),
    },
}))

describe('userService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(db.$transaction).mockImplementation(async (cb) => {
            if (Array.isArray(cb)) {
                return Promise.all(cb)
            }
            return cb(db)
        })
    })

    it('getProfile returns expected formatting', async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue({
            id: 'u1', name: 'N', email: 'e', image: null, githubRepoUrl: null,
            subscriptionTier: 'FREE', createdAt: new Date(),
            accounts: [{ provider: 'github' }, { provider: 'google' }]
        } as any)

        const res = await userService.getProfile('u1')
        expect(res.success).toBe(true)
        expect(res.data?.githubConnected).toBe(true)
        expect(res.data?.googleConnected).toBe(true)
    })

    it('setGithubRepoUrl validates URL length', async () => {
        const res = await userService.setGithubRepoUrl('u1', 'invalid')
        expect(res.success).toBe(false)
        expect(res.error).toBe('Must be a valid GitHub repository URL')

        const res2 = await userService.setGithubRepoUrl('u1', 'https://github.com/a/b')
        expect(res2.success).toBe(true)
    })

    it('exportUserData gathers all correctly', async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue({
            id: 'u1', name: 'N', email: 'e', image: null, githubRepoUrl: null,
            subscriptionTier: 'FREE', createdAt: new Date(),
            accounts: [{ provider: 'github' }]
        } as any)
        vi.mocked(db.resume.findMany).mockResolvedValue([])
        vi.mocked(db.jobDescription.findMany).mockResolvedValue([])
        vi.mocked(db.matchResult.findMany).mockResolvedValue([])
        vi.mocked(db.aIGeneration.findMany).mockResolvedValue([])
        vi.mocked(db.analyticsEvent.findMany).mockResolvedValue([])

        const res = await userService.exportUserData('u1')
        expect(res.success).toBe(true)
        expect(res.data?.resumes).toBeDefined()
        expect(res.data?.user.githubConnected).toBe(true)
    })

    it('deleteAccount handles R2 deletion, db transaction, and caches', async () => {
        vi.mocked(db.resume.findMany).mockResolvedValue([{ id: 'r1', originalFileUrl: 'url' }] as any)
        vi.mocked(storageService.deleteResumeFile).mockResolvedValue(true as any)

        const res = await userService.deleteAccount('u1')

        expect(res.success).toBe(true)
        expect(storageService.deleteResumeFile).toHaveBeenCalledWith('u1', 'url')
        expect(db.$transaction).toHaveBeenCalled()
        expect(cacheService.invalidate).toHaveBeenCalled()
    })
})
