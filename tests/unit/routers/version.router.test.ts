import { describe, it, expect, vi, beforeEach } from 'vitest'
import { versionRouter } from '@/server/routers/version.router'
import { versionService } from '@/server/services/version.service'
import { githubService } from '@/server/services/github.service'

vi.mock('@/server/services/version.service', () => ({
    versionService: {
        createVersion: vi.fn(),
        getVersions: vi.fn(),
        getVersion: vi.fn(),
        restoreVersion: vi.fn(),
    },
}))

vi.mock('@/server/services/github.service', () => ({
    githubService: {
        testConnection: vi.fn(),
    },
}))

describe('versionRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // createCaller is trpc standard, but we'll mock procedures instead by passing ctx
    const createCaller = (userId: string) => {
        return versionRouter.createCaller({
            session: { user: { id: userId, email: 'test@test.com', role: 'USER' } } as any,
            db: {} as any,
        })
    }

    it('create', async () => {
        const caller = createCaller('user-1')
        vi.mocked(versionService.createVersion).mockResolvedValue({ success: true,  data: { version: 1 } as any } as any)

        const result = await caller.create({ resumeId: 'res-1', changeNote: 'note' })

        expect(versionService.createVersion).toHaveBeenCalledWith('res-1', 'user-1', 'note')
        expect((result as any).data.version).toBe(1)
    })

    it('list', async () => {
        const caller = createCaller('user-1')
        vi.mocked(versionService.getVersions).mockResolvedValue({ success: true,  data: [] } as any)

        const result = await caller.list({ resumeId: 'res-1' })

        expect(versionService.getVersions).toHaveBeenCalledWith('res-1', 'user-1')
        expect((result as any).data).toEqual([])
    })

    it('get', async () => {
        const caller = createCaller('user-1')
        vi.mocked(versionService.getVersion).mockResolvedValue({ success: true,  data: { version: 2 } as any } as any)

        const result = await caller.get({ resumeId: 'res-1', version: 2 })

        expect(versionService.getVersion).toHaveBeenCalledWith('res-1', 'user-1', 2)
        expect((result as any).data.version).toBe(2)
    })

    it('restore', async () => {
        const caller = createCaller('user-1')
        vi.mocked(versionService.restoreVersion).mockResolvedValue({ success: true,  data: { id: 'res-1' } as any } as any)

        const result = await caller.restore({ resumeId: 'res-1', version: 2 })

        expect(versionService.restoreVersion).toHaveBeenCalledWith('res-1', 'user-1', 2)
        expect((result as any).data.id).toBe('res-1')
    })

    it('testGithub', async () => {
        const caller = createCaller('user-1')
        vi.mocked(githubService.testConnection).mockResolvedValue({ success: true,  data: { connected: true, repoName: 'u/r' } as any } as any)

        const result = await caller.testGithub()

        expect(githubService.testConnection).toHaveBeenCalledWith('user-1')
        expect((result as any).data.connected).toBe(true)
    })
})
