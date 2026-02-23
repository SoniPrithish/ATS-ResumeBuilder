import { db } from '@/server/lib/db'
import type { ServiceResult } from '@/types/common'
import type { CanonicalResume } from '@/types/resume'
import { extractTextFromPdf } from '@/modules/parser/pdf-parser'
import { parseLinkedInPdf } from '@/modules/parser/linkedin-pdf-parser'
import { resumeService } from '@/server/services/resume.service'
import { logger } from '@/server/lib/logger'

export const linkedinService = {
    async importFromPdf(
        userId: string,
        buffer: Buffer
    ): Promise<ServiceResult<{ resumeId: string; parsedData: CanonicalResume }>> {
        try {
            // 1. Extract text from PDF
            const text = await extractTextFromPdf(buffer)

            if (!text || text.trim() === '') {
                return { success: false, error: 'Could not extract text from PDF' }
            }

            // 2. Check if it's a LinkedIn export
            if (!parseLinkedInPdf(text)) {
                return {
                    success: false,
                    
                    error: "This doesn't appear to be a LinkedIn PDF export. Please download your profile as PDF from LinkedIn: Profile → More → Save to PDF",

                }
            }

            // 3. Parse using LinkedIn-specific parser
            const parsedData = parseLinkedInPdf(text)
            if (!parsedData) throw new Error('Failed to parse LinkedIn PDF')

            // 4. Create a new resume in DB
            const dateString = new Date().toISOString().split('T')[0]
            const createRes = await resumeService.createResume(userId, {
                title: `LinkedIn Import — ${dateString}`,
            })

            if (!createRes.success || !createRes.data) {
                return { success: false, error: (createRes as any).error || 'Failed to create resume' }
            }

            const resumeId = (createRes as any).data.id

            // 5. Update the resume with parsed data
            const updateRes = await resumeService.updateResume((resumeId as string), userId, {
                contactInfo: (parsedData as any).contactInfo as any,
                summary: parsedData.summary,
                experience: parsedData.experience as any,
                education: parsedData.education as any,
                skills: parsedData.skills as any,
                projects: parsedData.projects as any,
                certifications: parsedData.certifications as any,
                rawText: text,
            })

            if (!updateRes.success) {
                return { success: false, error: 'Failed to save parsed LinkedIn data' }
            }

            // 6. Log analytics event
            queueMicrotask(async () => {
                try {
                    await db.analyticsEvent.create({
                        data: {
                            userId,
                            event: 'linkedin_imported',
                            metadata: { resumeId: resumeId as string },
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
