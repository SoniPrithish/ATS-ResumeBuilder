import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePdf } from '@/modules/export/pdf-generator'
import type { CanonicalResume } from '@/types/resume'

// Mock react-pdf since it does not work correctly in Vitest by default
vi.mock('@react-pdf/renderer', () => ({
    renderToBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
    Document: ({ children }: any) => children,
    Page: ({ children }: any) => children,
    Text: ({ children }: any) => children,
    View: ({ children }: any) => children,
    Link: ({ children }: any) => children,
    StyleSheet: { create: (s: any) => s },
}))

describe('generatePdf', () => {
    const sampleResume: CanonicalResume = {
        contact: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            linkedin: null,
            github: null,
            website: null,
            location: null,
        },
        summary: 'A summary',
        experience: [],
        education: [],
        skills: { technical: [], frameworks: [], tools: [], languages: [], soft: [], other: [] },
        projects: [],
        certifications: [],
        rawText: 'Raw',
    }

    const emptyResume: CanonicalResume = {
        contact: {
            name: null, email: null, phone: null, linkedin: null,
            github: null, website: null, location: null,
        },
        summary: null,
        experience: [],
        education: [],
        skills: { technical: [], frameworks: [], tools: [], languages: [], soft: [], other: [] },
        projects: [],
        certifications: [],
        rawText: '',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('generates buffer for classic template', async () => {
        const result = await generatePdf(sampleResume, {
            templateId: 'classic',
            format: 'pdf',
            includeLinks: true,
        })

        expect(result.buffer).toBeDefined()
        expect(result.mimeType).toBe('application/pdf')
        expect(result.fileName).toContain('john-doe')
        expect(result.fileName).toContain('classic')
    })

    it('generates buffer for modern template', async () => {
        const result = await generatePdf(sampleResume, {
            templateId: 'modern',
            format: 'pdf',
            includeLinks: true,
        })

        expect(result.buffer).toBeDefined()
        expect(result.mimeType).toBe('application/pdf')
        expect(result.fileName).toContain('modern')
    })

    it('generates buffer for minimal template', async () => {
        const result = await generatePdf(sampleResume, {
            templateId: 'minimal',
            format: 'pdf',
            includeLinks: true,
        })

        expect(result.buffer).toBeDefined()
        expect(result.mimeType).toBe('application/pdf')
        expect(result.fileName).toContain('minimal')
    })

    it('throws EXPORT_EMPTY_RESUME for empty resume', async () => {
        await expect(
            generatePdf(emptyResume, {
                templateId: 'classic',
                format: 'pdf',
                includeLinks: true,
            })
        ).rejects.toThrow('EXPORT_EMPTY_RESUME')
    })

    it('applies custom color accent', async () => {
        const result = await generatePdf(sampleResume, {
            templateId: 'modern',
            format: 'pdf',
            includeLinks: true,
            colorAccent: '#FF0000',
        })
        expect(result.buffer).toBeDefined()
    })

    it('generates correct filename including slugified name', async () => {
        const result = await generatePdf(
            {
                ...sampleResume,
                contact: { ...sampleResume.contact, name: 'Jane & Doe!' },
            },
            { templateId: 'classic', format: 'pdf', includeLinks: true }
        )

        expect(result.fileName).toContain('jane-and-doe_classic_')
    })
})
