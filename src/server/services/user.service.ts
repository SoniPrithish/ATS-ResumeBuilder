import { db } from '@/server/lib/db'
import type { ServiceResult } from '@/types/common'
import { storageService } from '@/server/services/storage.service'
import { cacheService } from '@/server/services/cache.service'

export interface UserProfile {
    id: string
    name: string | null
    email: string
    image: string | null
    githubRepoUrl: string | null
    subscriptionTier: 'FREE' | 'PRO' | 'ENTERPRISE'
    createdAt: string
    githubConnected: boolean
    googleConnected: boolean
}

export interface UpdateProfileInput {
    name?: string
    githubRepoUrl?: string
}

export interface UserDataExport {
    user: UserProfile
    resumes: any[]
    jobDescriptions: any[]
    matchResults: any[]
    aiGenerations: any[]
    analyticsEvents: any[]
    exportedAt: string
}

export const userService = {
    async getProfile(userId: string): Promise<ServiceResult<UserProfile>> {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: { accounts: true },
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const githubConnected = user.accounts.some((a) => a.provider === 'github')
        const googleConnected = user.accounts.some((a) => a.provider === 'google')

        return {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email || '',
                image: user.image,
                githubRepoUrl: user.githubRepoUrl,
                subscriptionTier: user.subscriptionTier,
                createdAt: user.createdAt.toISOString(),
                githubConnected,
                googleConnected,
            },
                        
        }
    },

    async updateProfile(userId: string, data: UpdateProfileInput): Promise<ServiceResult<UserProfile>> {
        try {
            await db.user.update({
                where: { id: userId },
                data: { name: data.name },
            })
            return this.getProfile(userId)
        } catch (e) {
            return { success: false, error: 'Failed to update profile' }
        }
    },

    async setGithubRepoUrl(userId: string, repoUrl: string): Promise<ServiceResult<void>> {
        try {
            const match = repoUrl.match(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/)
            if (!match) {
                return { success: false, error: 'Must be a valid GitHub repository URL' }
            }

            await db.user.update({
                where: { id: userId },
                data: { githubRepoUrl: repoUrl },
            })
            return { success: true, data: undefined }
        } catch (e) {
            return { success: false, error: 'Failed to update repository URL' }
        }
    },

    async exportUserData(userId: string): Promise<ServiceResult<UserDataExport>> {
        try {
            const profileResult = await this.getProfile(userId)
            if (!profileResult.success || !profileResult.data) {
                return { success: false, error: 'User not found' }
            }

            const [resumes, jobDescriptions, matchResults, aiGenerations, analyticsEvents] = await Promise.all([
                db.resume.findMany({ where: { userId } }),
                db.jobDescription.findMany({ where: { userId } }),
                db.matchResult.findMany({ where: { resume: { userId } } }),
                db.aIGeneration.findMany({
                    where: { userId },
                    select: { id: true, type: true, model: true, tokensUsed: true, latencyMs: true, createdAt: true },
                }),
                db.analyticsEvent.findMany({ where: { userId } }),
            ])

            return {
                success: true,
                data: {
                    user: profileResult.data,
                    resumes,
                    jobDescriptions,
                    matchResults,
                    aiGenerations,
                    analyticsEvents,
                    exportedAt: new Date().toISOString(),
                },
                                
            }
        } catch (e) {
            return { success: false, error: 'Failed to export data' }
        }
    },

    async deleteAccount(userId: string): Promise<ServiceResult<void>> {
        try {
            // Fetch resumes to delete associated files in R2 storage
            const resumes = await db.resume.findMany({
                where: { userId },
                select: { id: true, originalFileUrl: true },
            })

            for (const res of resumes) {
                if (res.originalFileUrl) {
                    await storageService.deleteResumeFile(userId, res.originalFileUrl).catch(() => { })
                }
            }

            // Prisma cascade deletion handling: we already defined onDelete: Cascade for user relations in schema!
            // But we will manually trigger deletion where Cascade might have limitations or to be explicit.
            await db.$transaction([
                db.analyticsEvent.deleteMany({ where: { userId } }),
                db.aIGeneration.deleteMany({ where: { userId } }),
                db.matchResult.deleteMany({ where: { resume: { userId } } }),
                db.resumeVersion.deleteMany({ where: { resume: { userId } } }),
                db.jobDescription.deleteMany({ where: { userId } }),
                db.resume.deleteMany({ where: { userId } }),
                db.session.deleteMany({ where: { userId } }),
                db.account.deleteMany({ where: { userId } }),
                db.user.delete({ where: { id: userId } }),
            ])

            // Invalidate caches
            await cacheService.invalidate(`analytics:stats:${userId}`)

            return { success: true, data: undefined }
        } catch (e) {
            console.error(e)
            return { success: false, error: 'Failed to delete account' }
        }
    },
}
