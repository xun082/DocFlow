import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  activeTab: string;
  width: number;
  refreshTrigger: number;
  lastOperationSource: string | null; // 标识最后一次操作来源：'document-page' | 'sidebar' | null
  toggle: () => void;
  open: () => void;
  close: () => void;
  setActiveTab: (tab: string) => void;
  setWidth: (width: number) => void;
  triggerRefresh: (source: string) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      activeTab: 'folder',
      width: 320,
      refreshTrigger: 0,
      lastOperationSource: null as string | null,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      setWidth: (width: number) => set({ width }),
      triggerRefresh: (source: string = 'unknown') =>
        set((state) => ({
          refreshTrigger: state.refreshTrigger + 1,
          lastOperationSource: source,
        })),
    }),
    {
      name: 'sidebar-state', // localStorage key
      partialize: (state) => ({
        isOpen: state.isOpen,
        activeTab: state.activeTab,
        width: state.width,
        refreshTrigger: state.refreshTrigger,
        lastOperationSource: state.lastOperationSource,
      }),
    },
  ),
);
