import { describe, it, expect } from 'vitest'
import { affiliateService } from '@/server/services/affiliate.service'
// import type { RankedSkillGap } from '@/types/job'

describe('affiliateService', () => {
    it('getRecommendations: returns recommendations for known skills', async () => {
        const gaps: RankedSkillGap[] = [
            {
                skill: 'React',
                category: 'critical',
                source: 'required',
                relatedSkillsInResume: [],
                rank: 1,
                priority: 50,
            } as any,
        ]

        const recs = await affiliateService.getRecommendations(gaps, 5)

        expect(recs.length).toBeGreaterThan(0)
        expect(recs[0].title).toContain('React')
    })

    it('getRecommendations: returns deduplicated mix of recommendations', async () => {
        const gaps: RankedSkillGap[] = [
            { skill: 'Python', category: 'critical' } as any,
            { skill: 'Django', category: 'recommended' } as any, // might not exist directly, but Python does
        ]

        const recs = await affiliateService.getRecommendations(gaps, 10)

        expect(recs.length).toBeGreaterThan(0)
        // Check duplicates by ID
        const ids = recs.map((r) => r.id)
        const uniqueIds = new Set(ids)
        expect(ids.length).toBe(uniqueIds.size)
    })

    it('getRecommendations: falls back to popular if no gaps provided', async () => {
        const recs = await affiliateService.getRecommendations([], 3)

        expect(recs.length).toBe(3)
        expect(recs[0].rating).toBeGreaterThanOrEqual(4.8) // Popular ones sorted by rating
    })

    it('getPopularRecommendations: respects category filter', async () => {
        const recs = await affiliateService.getPopularRecommendations('certification', 5)

        expect(recs.length).toBeGreaterThan(0)
        for (const rec of recs) {
            expect(rec.type).toBe('certification')
        }
    })

    it('getPopularRecommendations: respects limit', async () => {
        const recs = await affiliateService.getPopularRecommendations(undefined, 2)
        expect(recs.length).toBe(2)
    })
})
