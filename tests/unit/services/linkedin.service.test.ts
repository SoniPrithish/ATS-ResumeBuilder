import { describe, it, expect, vi, beforeEach } from 'vitest'
import { linkedinService } from '@/server/services/linkedin.service'
import { extractTextFromPdf } from '@/modules/parser/pdf-parser'
import { isLinkedInFormat, parseLinkedInPdf } from '@/modules/parser/linkedin-pdf-parser'
import { resumeService } from '@/server/services/resume.service'
import { db } from '@/server/lib/db'

vi.mock('@/modules/parser/pdf-parser', () => ({
    extractTextFromPdf: vi.fn(),
}))

vi.mock('@/modules/parser/linkedin-pdf-parser', () => ({
    isLinkedInFormat: vi.fn(),
    parseLinkedInPdf: vi.fn(),
}))

vi.mock('@/server/services/resume.service', () => ({
    resumeService: {
        createResume: vi.fn(),
        updateResume: vi.fn(),
    },
}))

vi.mock('@/server/lib/db', () => ({
    db: {
        analyticsEvent: {
            create: vi.fn(),
        },
    },
}))

describe('linkedinService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('imports from valid LinkedIn PDF', async () => {
        const fakeBuffer = Buffer.from('data')
        const fakeText = 'LinkedIn Profile'
        const parsedData = {
            contactInfo: { fullName: 'John', email: '' },
            summary: 'Hello',
            experience: [],
            education: [],
            skills: { technical: [], soft: [], tools: [] },
            projects: [],
            certifications: [],
        }

        vi.mocked(extractTextFromPdf).mockResolvedValue(fakeText)
        vi.mocked(isLinkedInFormat).mockReturnValue(true)
        vi.mocked(parseLinkedInPdf).mockReturnValue(parsedData)

        vi.mocked(resumeService.createResume).mockResolvedValue({
            success: true,
            data: { id: 'res-import-1' },
        })

        vi.mocked(resumeService.updateResume).mockResolvedValue({
            success: true,
            data: {},
        })

        const result = await linkedinService.importFromPdf('user-1', fakeBuffer)

        expect(result.success).toBe(true)
        expect((result as any).data?.resumeId).toBe('res-import-1')
        expect((result as any).data?.parsedData).toEqual(parsedData)
        expect(resumeService.createResume).toHaveBeenCalled()
        expect(resumeService.updateResume).toHaveBeenCalled()
    })

    it('fails if PDF extraction fails or is empty', async () => {
        vi.mocked(extractTextFromPdf).mockResolvedValue('')

        const result = await linkedinService.importFromPdf('user-1', Buffer.from(''))

        expect(result.success).toBe(false)
        expect((result as any).error).toMatch('Could not extract text')
    })

    it('fails if not a LinkedIn PDF', async () => {
        vi.mocked(extractTextFromPdf).mockResolvedValue('Some generic resume text')
        vi.mocked(isLinkedInFormat).mockReturnValue(false)

        const result = await linkedinService.importFromPdf('user-1', Buffer.from(''))

        expect(result.success).toBe(false)
        expect((result as any).error).toMatch("doesn't appear to be a LinkedIn PDF")
    })

    it('fails if createResume fails', async () => {
        vi.mocked(extractTextFromPdf).mockResolvedValue('LinkedIn Profile')
        vi.mocked(isLinkedInFormat).mockReturnValue(true)
        vi.mocked(parseLinkedInPdf).mockReturnValue({
            contactInfo: { fullName: 'John', email: '' },
            summary: 'Hello',
            experience: [],
            education: [],
            skills: { technical: [], soft: [], tools: [] },
            projects: [],
            certifications: [],
        })
        vi.mocked(resumeService.createResume).mockResolvedValue({
            success: false,
            error: 'DB Error',
        })

        const result = await linkedinService.importFromPdf('user-1', Buffer.from(''))

        expect(result.success).toBe(false)
        expect((result as any).error).toMatch('DB Error')
    })

    it('fails if updateResume fails', async () => {
        vi.mocked(extractTextFromPdf).mockResolvedValue('LinkedIn Profile')
        vi.mocked(isLinkedInFormat).mockReturnValue(true)
        vi.mocked(parseLinkedInPdf).mockReturnValue({
            contactInfo: { fullName: 'John', email: '' },
            summary: 'Hello',
            experience: [],
            education: [],
            skills: { technical: [], soft: [], tools: [] },
            projects: [],
            certifications: [],
        })
        vi.mocked(resumeService.createResume).mockResolvedValue({
            success: true,
            data: { id: 'res-import-1' },
        })
        vi.mocked(resumeService.updateResume).mockResolvedValue({
            success: false,
            error: 'Failed',
        })

        const result = await linkedinService.importFromPdf('user-1', Buffer.from(''))

        expect(result.success).toBe(false)
        expect((result as any).error).toMatch('Failed to save')
    })
})
