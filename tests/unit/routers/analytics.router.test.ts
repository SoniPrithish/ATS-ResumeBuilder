import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyticsRouter } from '@/server/routers/analytics.router'
import { analyticsService } from '@/server/services/analytics.service'

vi.mock('@/server/services/analytics.service', () => ({
    analyticsService: {
        getUserStats: vi.fn(),
        getScoreTrend: vi.fn(),
        getRecentActivity: vi.fn(),
    },
}))

describe('analyticsRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const createCaller = (userId: string) => {
        return analyticsRouter.createCaller({
            session: { user: { id: userId, email: 'test@test.com', role: 'USER' } } as any,
            db: {} as any, headers: undefined, redis: {} as any,
        })
    }

    it('stats', async () => {
        const caller = createCaller('u1')
        vi.mocked(analyticsService.getUserStats).mockResolvedValue({ success: true,  data: { totalResumes: 5 } as any } as any)

        const res = await caller.stats()
        expect(analyticsService.getUserStats).toHaveBeenCalledWith('u1')
        expect((res as any).data.totalResumes).toBe(5)
    })

    it('scoreTrend', async () => {
        const caller = createCaller('u1')
        vi.mocked(analyticsService.getScoreTrend).mockResolvedValue({ success: true,  data: [] } as any)

        const res = await caller.scoreTrend({ limit: 5 })
        expect(analyticsService.getScoreTrend).toHaveBeenCalledWith('u1', 5)
        expect((res as any).data).toEqual([])
    })

    it('recentActivity', async () => {
        const caller = createCaller('u1')
        vi.mocked(analyticsService.getRecentActivity).mockResolvedValue({ success: true,  data: [] } as any)

        const res = await caller.recentActivity({ limit: 15 })
        expect(analyticsService.getRecentActivity).toHaveBeenCalledWith('u1', 15)
        expect((res as any).data).toEqual([])
    })
})
