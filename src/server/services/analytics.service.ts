import { db } from '@/server/lib/db'
import type { ServiceResult } from '@/types/common'
import { cacheService } from '@/server/services/cache.service'
import { logger } from '@/server/lib/logger'

export interface UserStats {
    totalResumes: number
    averageAtsScore: number | null
    totalJDsMatched: number
    totalAIEnhancements: number
    bestMatchScore: number | null
    resumesThisMonth: number
}

export interface ScoreTrendPoint {
    date: string
    score: number
    resumeTitle: string
}

export interface ActivityItem {
    id: string
    event: string
    description: string
    metadata: Record<string, any> | null
    createdAt: string
    icon: string
}

export const analyticsService = {
    async trackEvent(
        userId: string | null,
        event: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        queueMicrotask(async () => {
            try {
                await db.analyticsEvent.create({
                    data: {
                        userId,
                        event,
                        metadata: metadata || null,
                    } as any,
                })
            } catch (error) {
                logger.warn({ err: error, event }, 'Failed to track analytics event')
            }
        })
    },

    async getUserStats(userId: string): Promise<ServiceResult<UserStats>> {
        const cacheKey = `analytics:stats:${userId}`
        const cached = await cacheService.getCached<UserStats>(cacheKey)
        if (cached) {
            return { success: true, data: cached }
        }

        try {
            const now = new Date()
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            const [
                totalResumes,
                resumesWithScores,
                totalJDsMatched,
                totalAIEnhancements,
                bestMatchResult,
                resumesThisMonth,
            ] = await Promise.all([
                db.resume.count({ where: { userId, status: { not: 'ARCHIVED' } } }),
                db.resume.findMany({
                    where: { userId, lastAtsScore: { not: null } },
                    select: { lastAtsScore: true },
                }),
                db.matchResult.count({ where: { resume: { userId } } }),
                db.aIGeneration.count({ where: { userId } }),
                db.matchResult.findFirst({
                    where: { resume: { userId } },
                    orderBy: { overallScore: 'desc' },
                    select: { overallScore: true },
                }),
                db.resume.count({
                    where: { userId, createdAt: { gte: firstDayOfMonth } },
                }),
            ])

            let averageAtsScore: number | null = null
            if (resumesWithScores.length > 0) {
                const sum = resumesWithScores.reduce((acc, curr) => acc + (curr.lastAtsScore ?? 0), 0)
                averageAtsScore = Math.round(sum / resumesWithScores.length)
            }

            const stats: UserStats = {
                totalResumes,
                averageAtsScore,
                totalJDsMatched,
                totalAIEnhancements,
                bestMatchScore: bestMatchResult?.overallScore ?? null,
                resumesThisMonth,
            }

            await cacheService.setCached(cacheKey, stats, 5 * 60) // 5 minutes TTL
            return { success: true, data: stats }
        } catch (error) {
            logger.error({ err: error, userId }, 'Failed to get user stats')
            return { success: false, error: 'Internal server error' }
        }
    },

    async getScoreTrend(
        userId: string,
        limit: number = 10
    ): Promise<ServiceResult<ScoreTrendPoint[]>> {
        try {
            const events = await db.analyticsEvent.findMany({
                where: { userId, event: 'ats_scored' },
                orderBy: { createdAt: 'desc' },
                take: limit,
            })

            const points: ScoreTrendPoint[] = events.map((event) => {
                const metadata = (event.metadata as Record<string, any>) || {}
                return {
                    date: event.createdAt.toISOString(),
                    score: metadata.score || 0,
                    resumeTitle: metadata.resumeTitle || 'Unknown Resume',
                }
            })

            // Return oldest first for charting
            return { success: true, data: points.reverse() }
        } catch (error) {
            logger.error({ err: error, userId }, 'Failed to get score trend')
            return { success: false, error: 'Internal server error' }
        }
    },

    async getRecentActivity(
        userId: string,
        limit: number = 20
    ): Promise<ServiceResult<ActivityItem[]>> {
        try {
            const events = await db.analyticsEvent.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            })

            const items: ActivityItem[] = events.map((event) => {
                const metadata = (event.metadata as Record<string, any>) || {}
                let description = event.event
                let icon = 'Activity'

                switch (event.event) {
                    case 'resume_created':
                        description = `Created resume: ${metadata.title || 'Untitled'}`
                        icon = 'FilePlus'
                        break
                    case 'resume_uploaded':
                        description = `Uploaded resume: ${metadata.fileName || 'File'}`
                        icon = 'Upload'
                        break
                    case 'ats_scored':
                        description = `ATS scored resume: ${metadata.resumeTitle || 'Resume'} — Score: ${metadata.score || 0}`
                        icon = 'BarChart'
                        break
                    case 'jd_matched':
                        description = `Matched with JD: ${metadata.jdTitle || 'Job'} — Score: ${metadata.score || 0}%`
                        icon = 'GitCompare'
                        break
                    case 'ai_enhancement':
                        description = 'AI enhanced bullet point'
                        icon = 'Sparkles'
                        break
                    case 'resume_exported':
                        description = `Exported resume as ${metadata.format || 'file'}`
                        icon = 'Download'
                        break
                    case 'linkedin_imported':
                        description = 'Imported LinkedIn profile'
                        icon = 'Linkedin'
                        break
                    case 'version_created':
                        description = `Saved version v${metadata.version || 1}`
                        icon = 'GitBranch'
                        break
                }

                return {
                    id: event.id,
                    event: event.event,
                    description,
                    metadata: event.metadata as Record<string, any> | null,
                    createdAt: event.createdAt.toISOString(),
                    icon,
                }
            })

            return { success: true, data: items }
        } catch (error) {
            logger.error({ err: error, userId }, 'Failed to get recent activity')
            return { success: false, error: 'Internal server error' }
        }
    },
}
