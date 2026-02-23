import { describe, it, expect, vi, beforeEach } from 'vitest'
import { githubService } from '@/server/services/github.service'
import { db } from '@/server/lib/db'

vi.mock('@/server/lib/db', () => ({
    db: {
        account: {
            findFirst: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    },
}))

describe('githubService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('fetch', vi.fn())
    })

    it('createOrUpdateResumeVersion: new file created', async () => {
        vi.mocked(db.account.findFirst).mockResolvedValue({ access_token: 'token' } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        // GET Mock (404 Not Found -> New file scenario)
        // PUT Mock (201 Created)
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                status: 404,
                ok: false,
            } as any)
            .mockResolvedValueOnce({
                status: 201,
                ok: true,
                json: () => Promise.resolve({ commit: { sha: 'sha1', html_url: 'url' } }),
            } as any)

        const result = await githubService.createOrUpdateResumeVersion('user-1', 'res-1', 1, {} as any)
        expect(result.success).toBe(true)
        expect(result.data?.commitSha).toBe('sha1')
    })

    it('createOrUpdateResumeVersion: existing file updated', async () => {
        vi.mocked(db.account.findFirst).mockResolvedValue({ access_token: 'token' } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        // GET Mock (200 OK -> Existing file scenario)
        vi.mocked(fetch)
            .mockResolvedValueOnce({
                status: 200,
                ok: true,
                json: () => Promise.resolve({ sha: 'old-sha' }),
            } as any)
            .mockResolvedValueOnce({
                status: 200,
                ok: true,
                json: () => Promise.resolve({ commit: { sha: 'new-sha', html_url: 'url' } }),
            } as any)

        const result = await githubService.createOrUpdateResumeVersion('user-1', 'res-1', 2, {} as any)
        expect(result.success).toBe(true)
        expect(result.data?.commitSha).toBe('new-sha')
    })

    it('getResumeVersions returns sorted versions', async () => {
        vi.mocked(db.account.findFirst).mockResolvedValue({ access_token: 'token' } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([
                { sha: 'sha1', html_url: 'u1', commit: { message: 'Resume update v2: Note', author: { date: '2023' } } },
                { sha: 'sha2', html_url: 'u2', commit: { message: 'Resume update v1: Note', author: { date: '2023' } } },
            ])
        } as any)

        const result = await githubService.getResumeVersions('user-1', 'res-1')
        expect(result.success).toBe(true)
        expect(result.data?.[0].version).toBe(2)
    })

    it('getResumeVersion returns data', async () => {
        vi.mocked(db.account.findFirst).mockResolvedValue({ access_token: 'token' } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        const b64 = Buffer.from('{"summary":"Hello"}').toString('base64')
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ content: b64 })
        } as any)

        const result = await githubService.getResumeVersion('user-1', 'res-1', 1)
        expect(result.success).toBe(true)
        expect((result.data as any).summary).toBe('Hello')
    })

    it('testConnection connected true', async () => {
        vi.mocked(db.account.findFirst).mockResolvedValue({ access_token: 'token' } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        vi.mocked(fetch).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ full_name: 'a/b' })
        } as any)

        const result = await githubService.testConnection('user-1')
        expect(result.success).toBe(true)
        expect(result.data?.connected).toBe(true)
    })

    it('testConnection errors on invalid repo', async () => {
        vi.mocked(db.account.findFirst).mockResolvedValue({ access_token: 'token' } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        vi.mocked(fetch).mockResolvedValueOnce({ status: 404 } as any)

        const result = await githubService.testConnection('user-1')
        expect(result.success).toBe(false)
    })

    it('testConnection errors on no token', async () => {
        vi.mocked(db.account.findFirst).mockResolvedValue(null)
        const result = await githubService.testConnection('user-1')
        expect(result.success).toBe(false)
    })
})
