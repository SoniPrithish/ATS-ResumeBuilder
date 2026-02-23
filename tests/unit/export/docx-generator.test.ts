import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateDocx } from '@/modules/export/docx-generator'
import type { CanonicalResume } from '@/types/resume'

// Mock the docx library to avoid actually generating a complex DOCX file in tests
vi.mock('docx', async () => {
    const actual = await vi.importActual('docx')
    return {
        ...actual,
        Packer: {
            toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-docx-buffer')),
        },
    }
})

describe('generateDocx', () => {
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

    it('generates non-empty buffer for generic docx template', async () => {
        const result = await generateDocx(sampleResume, {
            templateId: 'classic',
            format: 'docx',
            includeLinks: true,
        })

        expect(result.buffer).toBeDefined()
        expect(result.buffer.length).toBeGreaterThan(0)
        expect(result.mimeType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        expect(result.fileName).toContain('john-doe')
        expect(result.fileName).toContain('classic')
        expect(result.fileName).toContain('.docx')
    })

    it('throws EXPORT_EMPTY_RESUME for empty resume', async () => {
        await expect(
            generateDocx(emptyResume, {
                templateId: 'classic',
                format: 'docx',
                includeLinks: true,
            })
        ).rejects.toThrow('EXPORT_EMPTY_RESUME')
    })

    it('generates all sections when present', async () => {
        const result = await generateDocx({
            ...sampleResume,
            experience: [{
                title: 'SWE',
                company: 'Company A',
                location: 'Remote',
                startDate: 'Jan 2020',
                endDate: 'Dec 2021',
                bullets: ['Did stuff']
            }],
            education: [{
                degree: 'BS',
                institution: 'University',
                location: 'Campus',
                graduationDate: '2019',
                gpa: '4.0',
                relevantCoursework: ['Math']
            }],
            skills: {
                technical: ['JS'],
                frameworks: ['React'],
                tools: ['Git'],
                languages: [],
                soft: ['Talking'],
                other: []
            },
            projects: [{
                name: 'Project B',
                description: 'Desc',
                technologies: ['React'],
                url: 'example.com',
                bullets: ['Built UI']
            }],
            certifications: [{
                name: 'AWS',
                issuer: 'Amazon',
                date: '2023',
                url: null
            }]
        }, { templateId: 'modern', format: 'docx', includeLinks: true })

        expect(result.buffer).toBeDefined()
    })
})
