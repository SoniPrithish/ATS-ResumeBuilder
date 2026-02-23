import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyticsService } from '@/server/services/analytics.service'
import { cacheService } from '@/server/services/cache.service'
import { db } from '@/server/lib/db'

vi.mock('@/server/lib/db', () => ({
    db: {
        analyticsEvent: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        resume: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
        matchResult: {
            count: vi.fn(),
            findFirst: vi.fn(),
        },
        aIGeneration: {
            count: vi.fn(),
        },
    },
}))

vi.mock('@/server/services/cache.service', () => ({
    cacheService: {
        get: vi.fn(),
        set: vi.fn(),
        getCached: vi.fn(),
        setCached: vi.fn(),
    },
}))

describe('analyticsService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('queueMicrotask', (fn: () => void) => fn())
    })

    it('trackEvent: creates DB record without throwing', async () => {
        vi.mocked(db.analyticsEvent.create).mockResolvedValue({} as any)

        await analyticsService.trackEvent('user-1', 'event', { meta: 1 })

        expect(db.analyticsEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { userId: 'user-1', event: 'event', metadata: { meta: 1 } },
            })
        )
    })

    it('trackEvent: swallows errors internally', async () => {
        vi.mocked(db.analyticsEvent.create).mockRejectedValue(new Error('fail'))

        await expect(analyticsService.trackEvent('u1', 'e')).resolves.not.toThrow()
    })

    it('getUserStats: correct aggregation from mock data', async () => {
        vi.mocked(cacheService.get).mockResolvedValue(null)

        vi.mocked(db.resume.count).mockResolvedValueOnce(5) // totalResumes
        vi.mocked(db.resume.findMany).mockResolvedValue([{ lastAtsScore: 80 }, { lastAtsScore: 90 }] as any) // scores
        vi.mocked(db.matchResult.count).mockResolvedValue(10) // totalJDsMatched
        vi.mocked(db.aIGeneration.count).mockResolvedValue(15) // totalAIEnhancements
        vi.mocked(db.matchResult.findFirst).mockResolvedValue({ overallScore: 95 } as any) // bestMatchResult
        vi.mocked(db.resume.count).mockResolvedValueOnce(2) // resumesThisMonth

        const res = await analyticsService.getUserStats('u1')

        expect(res.success).toBe(true)
        expect((res as any).data).toEqual({
            totalResumes: 5,
            averageAtsScore: 85,
            totalJDsMatched: 10,
            totalAIEnhancements: 15,
            bestMatchScore: 95,
            resumesThisMonth: 2,
        })
        expect(cacheService.set).toHaveBeenCalled()
    })

    it('getUserStats: returns cached if available', async () => {
        vi.mocked(cacheService.get).mockResolvedValue({ totalResumes: 99 } as any)

        const res = await analyticsService.getUserStats('u1')

        expect((res as any).data?.totalResumes).toBe(99)
        expect(db.resume.count).not.toHaveBeenCalled()
    })

    it('getScoreTrend: returns sorted points', async () => {
        vi.mocked(db.analyticsEvent.findMany).mockResolvedValue([
            { createdAt: new Date('2023-01-02'), metadata: { score: 90, resumeTitle: 'R2' } },
            { createdAt: new Date('2023-01-01'), metadata: { score: 80, resumeTitle: 'R1' } },
        ] as any)

        const res = await analyticsService.getScoreTrend('u1', 5)

        expect(res.success).toBe(true)
        expect((res as any).data?.length).toBe(2)
        // Points reversed for chart
        expect((res as any).data?.[0].score).toBe(80)
        expect((res as any).data?.[1].score).toBe(90)
    })

    it('getRecentActivity: maps events to readable descriptions', async () => {
        vi.mocked(db.analyticsEvent.findMany).mockResolvedValue([
            { id: '1', event: 'resume_created', metadata: { title: 'R1' }, createdAt: new Date() },
            { id: '2', event: 'ats_scored', metadata: { score: 85, resumeTitle: 'R2' }, createdAt: new Date() },
            { id: '3', event: 'unknown_event', metadata: null, createdAt: new Date() },
        ] as any)

        const res = await analyticsService.getRecentActivity('u1', 3)

        expect(res.success).toBe(true)
        expect((res as any).data?.[0].description).toBe('Created resume: R1')
        expect((res as any).data?.[0].icon).toBe('FilePlus')

        expect((res as any).data?.[1].description).toBe('ATS scored resume: R2 — Score: 85')
        expect((res as any).data?.[1].icon).toBe('BarChart')

        expect((res as any).data?.[2].description).toBe('unknown_event')
        expect((res as any).data?.[2].icon).toBe('Activity')
    })
})
