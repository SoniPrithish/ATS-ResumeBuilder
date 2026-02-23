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
        contactInfo: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            linkedin: undefined,
            github: undefined,
            website: undefined
        },
        summary: 'A summary',
        experience: [],
        education: [],
        skills: { technical: [], tools: [], soft: [] },
        projects: [],
        certifications: [],
        
    }

    const emptyResume: CanonicalResume = {
        contactInfo: {
            fullName: undefined as any, email: undefined as any, phone: undefined as any, linkedin: undefined,
            github: undefined, website: undefined
        },
        summary: undefined,
        experience: [],
        education: [],
        skills: { technical: [], tools: [], soft: [] },
        projects: [],
        certifications: [],
        
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
                id: 'exp1',
                current: false,
                title: 'SWE',
                company: 'Company A',
                location: 'Remote',
                startDate: 'Jan 2020',
                endDate: 'Dec 2021',
                bullets: ['Did stuff']
            }],
            education: [{
                id: 'edu1',
                degree: 'BS',
                field: 'Computer Science',
                institution: 'University',
                startDate: '2015',
                endDate: '2019',
                gpa: '4.0',
                coursework: ['Math']
            }],
            skills: {
                technical: ['JS'],
                languages: ['React'],
                tools: ['Git'],
                soft: ['Talking']
            },
            projects: [{
                id: 'proj1',
                name: 'Project B',
                description: 'Desc',
                technologies: ['React'],
                url: 'example.com',
                highlights: ['Built UI']
            }],
            certifications: [{
                id: 'cert1',
                name: 'AWS',
                issuer: 'Amazon',
                date: '2023',
                url: undefined
            }]
        }, { templateId: 'modern', format: 'docx', includeLinks: true })

        expect(result.buffer).toBeDefined()
    })
})
