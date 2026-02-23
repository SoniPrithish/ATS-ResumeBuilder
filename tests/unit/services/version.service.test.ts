import { describe, it, expect, vi, beforeEach } from 'vitest'
import { versionService } from '@/server/services/version.service'
import { githubService } from '@/server/services/github.service'
import { resumeService } from '@/server/services/resume.service'
import { db } from '@/server/lib/db'

vi.mock('@/server/lib/db', () => ({
    db: {
        resume: {
            findUnique: vi.fn(),
        },
        resumeVersion: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    },
}))

vi.mock('@/server/services/github.service', () => ({
    githubService: {
        createOrUpdateResumeVersion: vi.fn(),
    },
}))

vi.mock('@/server/services/resume.service', () => ({
    resumeService: {
        updateResume: vi.fn(),
    },
}))

describe('versionService', () => {
    const mockResume = {
        id: 'res-1',
        userId: 'user-1',
        contactInfo: {},
        summary: 'summary',
        experience: [],
        education: [],
        skills: {},
        projects: [],
        certifications: [],
        rawText: '',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('createVersion: increments version number and succeeds with snapshot', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue(mockResume as any)
        vi.mocked(db.resumeVersion.findFirst).mockResolvedValue({ version: 2 } as any)
        vi.mocked(db.resumeVersion.create).mockResolvedValue({ id: 'v1', version: 3, snapshot: {} } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: null } as any)

        const res = await versionService.createVersion('res-1', 'user-1', 'Notes')

        expect(res.success).toBe(true)
        expect(db.resumeVersion.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    version: 3,
                    changeNote: 'Notes',
                    snapshot: expect.anything(),
                })
            })
        )
    })

    it('createVersion: GitHub sync attempted if configured', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue(mockResume as any)
        vi.mocked(db.resumeVersion.findFirst).mockResolvedValue(null)
        vi.mocked(db.resumeVersion.create).mockResolvedValue({ id: 'v1', version: 1, snapshot: {} } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        vi.mocked(githubService.createOrUpdateResumeVersion).mockResolvedValue({
            success: true,
            data: { commitSha: 'sha1', url: 'url' },
            error: null,
            warnings: [],
        })

        vi.mocked(db.resumeVersion.update).mockResolvedValue({ id: 'v1' } as any)

        const res = await versionService.createVersion('res-1', 'user-1')

        expect(res.success).toBe(true)
        expect(githubService.createOrUpdateResumeVersion).toHaveBeenCalled()
        expect(db.resumeVersion.update).toHaveBeenCalled()
    })

    it('createVersion: GitHub sync failure does not fail version creation', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue(mockResume as any)
        vi.mocked(db.resumeVersion.findFirst).mockResolvedValue(null)
        vi.mocked(db.resumeVersion.create).mockResolvedValue({ id: 'v1', version: 1, snapshot: {} } as any)
        vi.mocked(db.user.findUnique).mockResolvedValue({ githubRepoUrl: 'https://github.com/a/b' } as any)

        vi.mocked(githubService.createOrUpdateResumeVersion).mockRejectedValue(new Error('GitHub error'))

        const res = await versionService.createVersion('res-1', 'user-1')

        expect(res.success).toBe(true)
    })

    it('getVersions: returns sorted list', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue(mockResume as any)
        vi.mocked(db.resumeVersion.findMany).mockResolvedValue([{ version: 2 }, { version: 1 }] as any[])

        const res = await versionService.getVersions('res-1', 'user-1')

        expect(res.success).toBe(true)
        expect(db.resumeVersion.findMany).toHaveBeenCalledWith({
            where: { resumeId: 'res-1' },
            orderBy: { version: 'desc' }
        })
    })

    it('getVersion: returns specific version', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue(mockResume as any)
        vi.mocked(db.resumeVersion.findFirst).mockResolvedValue({ version: 2 } as any)

        const res = await versionService.getVersion('res-1', 'user-1', 2)

        expect(res.success).toBe(true)
        expect((res as any).data?.version).toBe(2)
    })

    it('restoreVersion: creates new version + updates resume', async () => {
        vi.mocked(db.resume.findUnique).mockResolvedValue(mockResume as any)
        // mock getVersion internal call
        const snapshot = {
            contact: { name: 'Old' },
            summary: 'Old summary',
        }
        vi.mocked(db.resumeVersion.findFirst)
            .mockResolvedValueOnce({ version: 1, snapshot } as any) // target to restore
            .mockResolvedValueOnce({ version: 2 } as any)           // latest version to create new

        vi.mocked(db.resumeVersion.create).mockResolvedValue({ id: 'v3' } as any)
        vi.mocked(resumeService.updateResume).mockResolvedValue({ success: true, data: {} } as any)

        const res = await versionService.restoreVersion('res-1', 'user-1', 1)

        // Check backup was created
        expect(db.resumeVersion.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    changeNote: 'Backup before restoring to v1'
                })
            })
        )

        // Check resume updated
        expect(resumeService.updateResume).toHaveBeenCalledWith('res-1', 'user-1', expect.objectContaining({
            contactInfo: snapshot.contact,
            summary: snapshot.summary,
        }))
        expect(res.success).toBe(true)
    })
})
