import { db } from '@/server/lib/db'
import type { ServiceResult } from '@/types/common'
import { resumeService } from '@/server/services/resume.service'
import { githubService } from '@/server/services/github.service'
import type { ResumeVersion, Resume } from '@prisma/client'
import type { CanonicalResume } from '@/types/resume'
import { logger } from '@/server/lib/logger'

export const versionService = {
    async createVersion(
        resumeId: string,
        userId: string,
        changeNote?: string
    ): Promise<ServiceResult<ResumeVersion>> {
        try {
            const resume = await db.resume.findUnique({
                where: { id: resumeId },
            })

            if (!resume || resume.userId !== userId) {
                return { success: false, error: 'Resume not found or unauthorized' }
            }

            const latestVersion = await db.resumeVersion.findFirst({
                where: { resumeId },
                orderBy: { version: 'desc' },
            })

            const nextVersion = (latestVersion?.version ?? 0) + 1

            // Create snapshot from current DB data
            const snapshot: CanonicalResume = {
                contact: (resume.contactInfo as any) || {},
                summary: resume.summary,
                experience: (resume.experience as any) || [],
                education: (resume.education as any) || [],
                skills: (resume.skills as any) || { technical: [], frameworks: [], tools: [], languages: [], soft: [], other: [] },
                projects: (resume.projects as any) || [],
                certifications: (resume.certifications as any) || [],
                rawText: resume.rawText ?? '',
            }

            // 4. Create ResumeVersion record in DB
            let newVersion = await db.resumeVersion.create({
                data: {
                    resumeId: resume.id,
                    version: nextVersion,
                    snapshot: snapshot as any,
                    changeNote: changeNote || null,
                },
            })

            // 5. Optionally sync to GitHub
            const user = await db.user.findUnique({ where: { id: userId } })
            if (user?.githubRepoUrl) {
                try {
                    const ghResult = await githubService.createOrUpdateResumeVersion(
                        userId,
                        resumeId,
                        nextVersion,
                        snapshot,
                        changeNote
                    )
                    if (ghResult.success && ghResult.data?.commitSha) {
                        newVersion = await db.resumeVersion.update({
                            where: { id: newVersion.id },
                            data: { githubCommitSha: ghResult.data.commitSha },
                        })
                    }
                } catch (err) {
                    logger.warn({ err }, 'Failed to sync version to GitHub')
                }
            }

            return { success: true, data: newVersion }
        } catch (error) {
            logger.error({ err: error }, 'Failed to create resume version')
            return { success: false, error: 'Internal server error' }
        }
    },

    async getVersions(
        resumeId: string,
        userId: string
    ): Promise<ServiceResult<ResumeVersion[]>> {
        const resume = await db.resume.findUnique({ where: { id: resumeId } })
        if (!resume || resume.userId !== userId) {
            return { success: false, error: 'Resume not found or unauthorized' }
        }

        const versions = await db.resumeVersion.findMany({
            where: { resumeId },
            orderBy: { version: 'desc' },
        })

        return { success: true, data: versions }
    },

    async getVersion(
        resumeId: string,
        userId: string,
        version: number
    ): Promise<ServiceResult<ResumeVersion>> {
        const resume = await db.resume.findUnique({ where: { id: resumeId } })
        if (!resume || resume.userId !== userId) {
            return { success: false, error: 'Resume not found or unauthorized' }
        }

        const versionDoc = await db.resumeVersion.findFirst({
            where: { resumeId, version },
        })

        if (!versionDoc) {
            return { success: false, error: 'Version not found' }
        }

        return { success: true, data: versionDoc }
    },

    async restoreVersion(
        resumeId: string,
        userId: string,
        version: number
    ): Promise<ServiceResult<Resume>> {
        const targetVersionResponse = await this.getVersion(resumeId, userId, version)
        if (!targetVersionResponse.success || !targetVersionResponse.data) {
            return { success: false, error: targetVersionResponse.error } as any
        }

        const targetVersion = targetVersionResponse.data

        // Backup current state first
        await this.createVersion(resumeId, userId, `Backup before restoring to v${version}`)

        // Update resume data
        const snapshotData = targetVersion.snapshot as any
        const updated = await resumeService.updateResume(resumeId, userId, {
            contactInfo: snapshotData.contact,
            summary: snapshotData.summary,
            experience: snapshotData.experience,
            education: snapshotData.education,
            skills: snapshotData.skills,
            projects: snapshotData.projects,
            certifications: snapshotData.certifications,
            
        })

        return { success: true, data: updated as any }
    },
}
