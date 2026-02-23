import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/upload/linkedin/route'
import { linkedinService } from '@/server/services/linkedin.service'
import { auth } from '@/server/auth/config'

vi.mock('@/server/auth/config', () => ({
    auth: vi.fn(),
}))

vi.mock('@/server/services/linkedin.service', () => ({
    linkedinService: {
        importFromPdf: vi.fn(),
    },
}))

describe('POST /api/upload/linkedin', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    function createFormData(file: File) {
        const fd = new FormData()
        fd.append('file', file)
        return fd
    }

    it('returns 401 if not authenticated', async () => {
        vi.mocked(auth).mockResolvedValue(null)
        const req = new Request('http://localhost/api/upload/linkedin', { method: 'POST' })
        const res = await POST(req)
        expect(res.status).toBe(401)
    })

    it('returns 400 if no multipart/form-data', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
        const req = new Request('http://localhost/api/upload/linkedin', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
        })
        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'Must be a multipart/form-data request' })
    })

    it('returns 400 if no file', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
        const req = new Request('http://localhost/api/upload/linkedin', {
            method: 'POST',
            headers: { 'content-type': 'multipart/form-data' },
        })
        req.formData = async () => new FormData()
        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'No file uploaded' })
    })

    it('returns 400 if not PDF', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
        const fakeFile = new File(['text'], 'resume.txt', { type: 'text/plain' })

        const req = new Request('http://localhost/api/upload/linkedin', {
            method: 'POST',
            headers: { 'content-type': 'multipart/form-data' },
        })
        req.formData = async () => createFormData(fakeFile)

        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'File must be a PDF' })
    })

    it('returns 400 if import fails', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
        vi.mocked(linkedinService.importFromPdf).mockResolvedValue({
            success: false,
            data: null,
            error: 'Not a linkedin PDF',
            warnings: [],
        })

        const fakeFile = new File(['pdf-data'], 'resume.pdf', { type: 'application/pdf' })
        const req = new Request('http://localhost/api/upload/linkedin', {
            method: 'POST',
            headers: { 'content-type': 'multipart/form-data' },
        })
        req.formData = async () => createFormData(fakeFile)

        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'Not a linkedin PDF' })
    })

    it('returns 200 and resumeId if success', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
        vi.mocked(linkedinService.importFromPdf).mockResolvedValue({
            success: true,
            data: { resumeId: 'res-linkedin', parsedData: {} as any },
            error: null,
            warnings: [],
        })

        const fakeFile = new File(['pdf-data'], 'resume.pdf', { type: 'application/pdf' })
        const req = new Request('http://localhost/api/upload/linkedin', {
            method: 'POST',
            headers: { 'content-type': 'multipart/form-data' },
        })
        req.formData = async () => createFormData(fakeFile)

        const res = await POST(req)
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
            resumeId: 'res-linkedin',
            message: 'LinkedIn profile imported successfully',
        })
    })
})
