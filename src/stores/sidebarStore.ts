import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  activeTab: string;
  width: number;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setActiveTab: (tab: string) => void;
  setWidth: (width: number) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      activeTab: 'folder',
      width: 320,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      setWidth: (width: number) => set({ width }),
    }),
    {
      name: 'sidebar-state', // localStorage key
      partialize: (state) => ({
        isOpen: state.isOpen,
        activeTab: state.activeTab,
        width: state.width,
      }),
    },
  ),
);
