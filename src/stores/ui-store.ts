import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    mobileNavOpen: boolean;
    activeModal: string | null;
    toggleSidebar: () => void;
    toggleMobileNav: () => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    mobileNavOpen: false,
    activeModal: null,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),
}));
