import { db } from '@/server/lib/db'
import type { ServiceResult } from '@/types/common'
import { resumeService } from '@/server/services/resume.service'
import { githubService } from '@/server/services/github.service'
import type { Prisma, ResumeVersion, Resume } from '@prisma/client'
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

            const snapshot: CanonicalResume = {
                contactInfo: (resume.contactInfo as unknown as CanonicalResume['contactInfo']) || {
                    fullName: '',
                    email: '',
                },
                summary: resume.summary ?? undefined,
                experience: (resume.experience as unknown as CanonicalResume['experience']) || [],
                education: (resume.education as unknown as CanonicalResume['education']) || [],
                skills: (resume.skills as unknown as CanonicalResume['skills']) || {
                    technical: [],
                    soft: [],
                    tools: [],
                    languages: [],
                },
                projects: (resume.projects as unknown as CanonicalResume['projects']) || [],
                certifications: (resume.certifications as unknown as CanonicalResume['certifications']) || [],
                customSections: (resume.customSections as unknown as CanonicalResume['customSections']) || [],
            }

            let newVersion = await db.resumeVersion.create({
                data: {
                    resumeId: resume.id,
                    version: nextVersion,
                    snapshot: snapshot as unknown as Prisma.InputJsonValue,
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
        if (!targetVersionResponse.success) {
            return { success: false, error: targetVersionResponse.error }
        }
        if (!targetVersionResponse.data) {
            return { success: false, error: 'Version not found' }
        }

        const targetVersion = targetVersionResponse.data

        await this.createVersion(resumeId, userId, `Backup before restoring to v${version}`)

        const snapshotData = targetVersion.snapshot as unknown as Record<string, unknown>
        const contactInfo = (snapshotData.contactInfo ?? snapshotData.contact ?? {}) as Record<string, unknown>
        const summary = typeof snapshotData.summary === 'string' ? snapshotData.summary : undefined
        const experience = Array.isArray(snapshotData.experience)
            ? (snapshotData.experience as Record<string, unknown>[])
            : []
        const education = Array.isArray(snapshotData.education)
            ? (snapshotData.education as Record<string, unknown>[])
            : []
        const skills =
            snapshotData.skills && typeof snapshotData.skills === 'object'
                ? (snapshotData.skills as Record<string, unknown>)
                : { technical: [], soft: [], tools: [] }
        const projects = Array.isArray(snapshotData.projects)
            ? (snapshotData.projects as Record<string, unknown>[])
            : []
        const certifications = Array.isArray(snapshotData.certifications)
            ? (snapshotData.certifications as Record<string, unknown>[])
            : []

        const updated = await resumeService.updateResume(resumeId, userId, {
            contactInfo,
            summary,
            experience,
            education,
            skills,
            projects,
            certifications,
        })
        if (!updated.success) {
            return { success: false, error: updated.error || 'Failed to restore version' }
        }
        if (!updated.data) {
            return { success: false, error: 'Failed to restore version' }
        }

        return { success: true, data: updated.data as Resume }
    },
}
