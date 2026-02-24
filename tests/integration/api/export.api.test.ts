import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/export/[id]/route'
import { exportService } from '@/server/services/export.service'
import { auth } from '@/server/auth/config'

vi.mock('@/server/auth/config', () => ({
    auth: vi.fn(),
}))

vi.mock('@/server/services/export.service', () => ({
    exportService: {
        exportResume: vi.fn(),
    },
}))

describe('GET /api/export/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 401 if not authenticated', async () => {
        vi.mocked(auth).mockResolvedValue(null as any)
        const request = new Request('http://localhost/api/export/res-1')
        const response = await GET(request, { params: Promise.resolve({ id: 'res-1' }) })

        expect(response.status).toBe(401)
    })

    it('returns 400 for invalid format', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
        const request = new Request('http://localhost/api/export/res-1?format=txt')
        const response = await GET(request, { params: Promise.resolve({ id: 'res-1' }) })

        expect(response.status).toBe(400)
        expect(await response.text()).toBe('Invalid format')
    })

    it('returns 404 if resume not found', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
        vi.mocked(exportService.exportResume).mockResolvedValue({
            success: false,
            error: 'Resume not found',
            
        })

        const request = new Request('http://localhost/api/export/res-1')
        const response = await GET(request, { params: Promise.resolve({ id: 'res-1' }) })

        expect(response.status).toBe(404)
    })

    it('returns 403 if unauthorized', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
        vi.mocked(exportService.exportResume).mockResolvedValue({
            success: false,
            error: 'Unauthorized',
            
        })

        const request = new Request('http://localhost/api/export/res-1')
        const response = await GET(request, { params: Promise.resolve({ id: 'res-1' }) })

        expect(response.status).toBe(403)
    })

    it('returns 200 and buffer on success', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
        vi.mocked(exportService.exportResume).mockResolvedValue({
            success: true,
            data: {
                buffer: Buffer.from('pdf-data'),
                mimeType: 'application/pdf',
                fileName: 'resume.pdf',
                sizeBytes: 8,
            },
                        
        })

        const request = new Request('http://localhost/api/export/res-1')
        const response = await GET(request, { params: Promise.resolve({ id: 'res-1' }) })

        expect(response.status).toBe(200)
        expect(response.headers.get('Content-Type')).toBe('application/pdf')
        expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="resume.pdf"')
        expect(response.headers.get('Content-Length')).toBe('8')
    })
})
