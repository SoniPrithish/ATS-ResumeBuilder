import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportService } from '@/server/services/export.service'
import { db } from '@/server/lib/db'

// Mock Prisma
vi.mock('@/server/lib/db', () => ({
    db: {
        resume: {
            findUnique: vi.fn(),
        },
        analyticsEvent: {
            create: vi.fn(),
        },
    },
}))

// Mock standard modules
vi.mock('@/modules/export', () => ({
    exportResume: vi.fn().mockImplementation((resume, options) => {
        return Promise.resolve({
            buffer: Buffer.from('mocked'),
            mimeType: options.format === 'pdf' ? 'application/pdf' : 'application/docx',
            fileName: `mock.${options.format}`,
            sizeBytes: 10,
        })
    }),
}))

describe('exportService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('handles PDF export correctly', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue({
            id: 'res-1',
            userId: 'user-1',
            status: 'COMPLETE',
            contactInfo: {},
            summary: null,
            experience: [],
            education: [],
            skills: {},
            projects: [],
            certifications: [],
            rawText: 'RAW',
        } as any)

        const result = await exportService.exportResume('res-1', 'user-1', {
            templateId: 'classic',
            format: 'pdf',
            includeLinks: true,
        })

        expect(result.success).toBe(true)
        expect(result.data?.mimeType).toBe('application/pdf')
        expect(result.data?.buffer).toBeDefined()
        expect(db.resume.findUnique).toHaveBeenCalledWith({ where: { id: 'res-1' } })
    })

    it('handles DOCX export correctly', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue({
            id: 'res-1',
            userId: 'user-1',
            status: 'COMPLETE',
            contactInfo: {},
            summary: null,
            experience: [],
            education: [],
            skills: {},
            projects: [],
            certifications: [],
            rawText: '',
        } as any)

        const result = await exportService.exportResume('res-1', 'user-1', {
            templateId: 'modern',
            format: 'docx',
            includeLinks: true,
        })

        expect(result.success).toBe(true)
        expect(result.data?.mimeType).toBe('application/docx')
    })

    it('returns error if resume not found', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue(null)
        const result = await exportService.exportResume('res-1', 'user-1', {
            templateId: 'classic',
            format: 'pdf',
            includeLinks: true,
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Resume not found')
    })

    it('returns error if unauthorized user', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue({
            id: 'res-2',
            userId: 'user-other',
            status: 'COMPLETE',
        } as any)

        const result = await exportService.exportResume('res-2', 'user-me', {
            templateId: 'classic',
            format: 'pdf',
            includeLinks: true,
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Unauthorized')
    })

    it('returns error if archived', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue({
            id: 'res-3',
            userId: 'user-me',
            status: 'ARCHIVED',
        } as any)

        const result = await exportService.exportResume('res-3', 'user-me', {
            templateId: 'classic',
            format: 'pdf',
            includeLinks: true,
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Cannot export archived resume')
    })
})
