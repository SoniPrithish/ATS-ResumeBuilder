import { create } from 'zustand';
import { CanonicalResume, ResumeRecord } from '@/types/resume';

interface ResumeState {
    currentResume: ResumeRecord | null;
    isDirty: boolean;
    activeSection: string;
    previewMode: boolean;
    setResume: (resume: ResumeRecord | null) => void;
    updateSection: (section: keyof CanonicalResume, data: unknown) => void;
    setDirty: (dirty: boolean) => void;
    setActiveSection: (section: string) => void;
    togglePreview: () => void;
    reset: () => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
    currentResume: null,
    isDirty: false,
    activeSection: 'Contact Info',
    previewMode: false,
    setResume: (resume) => set({ currentResume: resume, isDirty: false }),
    updateSection: (section, data) =>
        set((state) => {
            if (!state.currentResume) return state;
            return {
                currentResume: {
                    ...state.currentResume,
                    [section]: data,
                },
                isDirty: true,
            };
        }),
    setDirty: (dirty) => set({ isDirty: dirty }),
    setActiveSection: (section) => set({ activeSection: section }),
    togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),
    reset: () => set({
        currentResume: null,
        isDirty: false,
        activeSection: 'Contact Info',
        previewMode: false
    }),
}));
// group 1 modifications
