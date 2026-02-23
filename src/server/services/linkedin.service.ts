import { db } from '@/server/lib/db'
import type { ServiceResult } from '@/types/common'
import type { CanonicalResume } from '@/types/resume'
import { extractTextFromPdf } from '@/modules/parser/pdf-parser'
import { isLinkedInFormat, parseLinkedInPdf } from '@/modules/parser/linkedin-pdf-parser'
import { resumeService } from '@/server/services/resume.service'
import { logger } from '@/server/lib/logger'

export const linkedinService = {
    async importFromPdf(
        userId: string,
        buffer: Buffer
    ): Promise<ServiceResult<{ resumeId: string; parsedData: CanonicalResume }>> {
        try {
            const text = await extractTextFromPdf(buffer)
            if (!text || text.trim() === '') {
                return { success: false, error: 'Could not extract text from PDF' }
            }

            if (!isLinkedInFormat(text)) {
                return {
                    success: false,
                    error: "This doesn't appear to be a LinkedIn PDF export. Please download your profile as PDF from LinkedIn: Profile → More → Save to PDF",
                }
            }

            const parsedData = parseLinkedInPdf(text)
            if (!parsedData || !parsedData.contactInfo.fullName) {
                return { success: false, error: 'Failed to parse LinkedIn PDF' }
            }

            const dateString = new Date().toISOString().split('T')[0]
            const createRes = await resumeService.createResume(userId, {
                title: `LinkedIn Import — ${dateString}`,
            })

            if (!createRes.success) {
                return { success: false, error: createRes.error || 'Failed to create resume' }
            }
            if (!createRes.data) {
                return { success: false, error: 'Failed to create resume' }
            }

            const createdResume = createRes.data as { id: string }
            const resumeId = createdResume.id

            const updateRes = await resumeService.updateResume(resumeId, userId, {
                contactInfo: parsedData.contactInfo as unknown as Record<string, unknown>,
                summary: parsedData.summary,
                experience: parsedData.experience as unknown as Record<string, unknown>[],
                education: parsedData.education as unknown as Record<string, unknown>[],
                skills: parsedData.skills as unknown as Record<string, unknown>,
                projects: (parsedData.projects ?? []) as unknown as Record<string, unknown>[],
                certifications: (parsedData.certifications ?? []) as unknown as Record<string, unknown>[],
            })

            if (!updateRes.success) {
                return { success: false, error: 'Failed to save parsed LinkedIn data' }
            }

            queueMicrotask(async () => {
                try {
                    await db.analyticsEvent.create({
                        data: {
                            userId,
                            event: 'linkedin_imported',
                            metadata: { resumeId },
                        },
                    })
                } catch (e) {
                    logger.warn({ err: e }, 'Failed to track linkedin import event')
                }
            })

            return {
                success: true,
                data: {
                    resumeId,
                    parsedData,
                },
            }
        } catch (error) {
            logger.error({ err: error }, 'LinkedIn PDF import failed')
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Import failed'
            }
        }
    }
}
