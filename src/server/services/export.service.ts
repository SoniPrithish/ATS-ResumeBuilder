import { db } from '@/server/lib/db'
import { exportResume } from '@/modules/export'
import type { ExportOptions, ExportResult } from '@/modules/export'
import type { ServiceResult } from '@/types/common'
import type {
    CanonicalResume,
    ContactInfo,
    ExperienceEntry,
    EducationEntry,
    SkillSet,
    ProjectEntry,
    CertificationEntry,
} from '@/types/resume'
import { logger } from '@/server/lib/logger'

export const exportService = {
    async exportResume(
        resumeId: string,
        userId: string,
        options: ExportOptions
    ): Promise<ServiceResult<ExportResult>> {
        try {
            const resume = await db.resume.findUnique({
                where: { id: resumeId },
            })

            if (!resume) {
                return {
                    success: false,
                    data: null,
                    error: 'Resume not found',
                    warnings: [],
                }
            }

            if (resume.userId !== userId) {
                return {
                    success: false,
                    data: null,
                    error: 'Unauthorized',
                    warnings: [],
                }
            }

            if (resume.status === 'ARCHIVED') {
                return {
                    success: false,
                    data: null,
                    error: 'Cannot export archived resume',
                    warnings: [],
                }
            }

            // Build CanonicalResume
            const canonicalResume: CanonicalResume = {
                contact: (resume.contactInfo as unknown as ContactInfo) || {
                    name: '',
                    email: '',
                    phone: '',
                    linkedin: '',
                    github: '',
                    website: '',
                    location: '',
                },
                summary: resume.summary,
                experience: (resume.experience as unknown as ExperienceEntry[]) || [],
                education: (resume.education as unknown as EducationEntry[]) || [],
                skills: (resume.skills as unknown as SkillSet) || {
                    technical: [],
                    frameworks: [],
                    tools: [],
                    languages: [],
                    soft: [],
                    other: [],
                },
                projects: (resume.projects as unknown as ProjectEntry[]) || [],
                certifications: (resume.certifications as unknown as CertificationEntry[]) || [],
                rawText: resume.rawText ?? '',
            }

            const exportResult = await exportResume(canonicalResume, options)

            // Fire and forget analytics tracking
            queueMicrotask(async () => {
                try {
                    await db.analyticsEvent.create({
                        data: {
                            userId,
                            event: 'resume_exported',
                            metadata: {
                                format: options.format,
                                templateId: options.templateId,
                            },
                        },
                    })
                } catch (e) {
                    logger.warn({ err: e }, 'Failed to track export analytics event')
                }
            })

            return {
                success: true,
                data: exportResult,
                error: null,
                warnings: [],
            }
        } catch (error) {
            logger.error({ err: error, resumeId }, 'Failed to export resume')
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Export failed',
                warnings: [],
            }
        }
    },
}
