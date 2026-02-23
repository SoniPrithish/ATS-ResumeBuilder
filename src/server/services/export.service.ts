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
                    error: 'Resume not found',
                }
            }

            if (resume.userId !== userId) {
                return {
                    success: false,
                    error: 'Unauthorized',
                }
            }

            if (resume.status === 'ARCHIVED') {
                return {
                    success: false,
                    error: 'Cannot export archived resume',
                }
            }

            // Build CanonicalResume
            const canonicalResume: CanonicalResume = {
                contactInfo: (resume.contactInfo as unknown as ContactInfo) || {
                    fullName: '',
                    email: '',
                    phone: '',
                    linkedin: '',
                    github: '',
                    website: '',
                    location: '',
                },
                summary: resume.summary ?? undefined,
                experience: (resume.experience as unknown as ExperienceEntry[]) || [],
                education: (resume.education as unknown as EducationEntry[]) || [],
                skills: (resume.skills as unknown as SkillSet) || {
                    technical: [],
                    
                    tools: [],
                    languages: [],
                    soft: [],
                    
                },
                projects: (resume.projects as unknown as ProjectEntry[]) || [],
                certifications: (resume.certifications as unknown as CertificationEntry[]) || [],
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
                data: exportResult
            }
        } catch (error) {
            logger.error({ err: error, resumeId }, 'Failed to export resume')
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Export failed'
            }
        }
    },
}
