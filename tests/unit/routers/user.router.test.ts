import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userRouter } from '@/server/routers/user.router'
import { userService } from '@/server/services/user.service'

vi.mock('@/server/services/user.service', () => ({
    userService: {
        getProfile: vi.fn(),
        updateProfile: vi.fn(),
        setGithubRepoUrl: vi.fn(),
        exportUserData: vi.fn(),
        deleteAccount: vi.fn(),
    },
}))

describe('userRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const createCaller = (userId: string) => {
        return userRouter.createCaller({
            session: { user: { id: userId, email: 'test@test.com', role: 'USER' } } as any,
            db: {} as any, headers: undefined, redis: {} as any,
        })
    }

    it('profile', async () => {
        const caller = createCaller('u1')
        vi.mocked(userService.getProfile).mockResolvedValue({ success: true,  data: { name: 'n' } as any } as any)
        const res = await caller.profile()
        expect((res as any).data.name).toBe('n')
    })

    it('updateProfile', async () => {
        const caller = createCaller('u1')
        vi.mocked(userService.updateProfile).mockResolvedValue({ success: true, data: {} } as any)
        await caller.updateProfile({ name: 'm' })
        expect(userService.updateProfile).toHaveBeenCalledWith('u1', { name: 'm' })
    })

    it('setGithubRepo rejects invalid URL at router zod level', async () => {
        const caller = createCaller('u1')
        await expect(caller.setGithubRepo({ repoUrl: 'bad' })).rejects.toThrow()
    })

    it('deleteAccount matches literal confirmation', async () => {
        const caller = createCaller('u1')
        vi.mocked(userService.deleteAccount).mockResolvedValue({ success: true } as any)
        // TypeScript/zod will throw if it's not string 'DELETE MY ACCOUNT'
        await expect(caller.deleteAccount({ confirmation: 'bad' as any })).rejects.toThrow()

        await caller.deleteAccount({ confirmation: 'DELETE MY ACCOUNT' })
        expect(userService.deleteAccount).toHaveBeenCalledWith('u1')
    })
})
