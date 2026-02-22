import { renderHook, act } from '@testing-library/react';
import { useResumeStore } from '@/stores/resume-store';
import { useUIStore } from '@/stores/ui-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/trpc-client', () => ({
    trpc: {
        useUtils: () => ({}),
        resume: {
            getById: { useQuery: vi.fn() },
            list: { useQuery: vi.fn() },
            create: { useMutation: vi.fn() },
            update: { useMutation: vi.fn() },
            delete: { useMutation: vi.fn() }
        }
    }
}));

describe('UI and Resume Stores', () => {
    beforeEach(() => {
        useResumeStore.getState().reset();
    });

    it('should update UI store state correctly', () => {
        const { result } = renderHook(() => useUIStore());
        expect(result.current.sidebarOpen).toBe(true);
        act(() => {
            result.current.toggleSidebar();
        });
        expect(result.current.sidebarOpen).toBe(false);
    });

    it('should set resume and dirty state', () => {
        const { result } = renderHook(() => useResumeStore());
        expect(result.current.currentResume).toBe(null);

        act(() => {
            result.current.setResume({ id: '1', title: 'Test Resume' } as any);
        });
        expect(result.current.currentResume?.id).toBe('1');
        expect(result.current.isDirty).toBe(false);

        act(() => {
            result.current.updateSection('summary', 'New Summary');
        });
        expect(result.current.isDirty).toBe(true);
        expect(result.current.currentResume?.summary).toBe('New Summary');
    });
});
