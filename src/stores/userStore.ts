import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 简化的用户 store，主要用于本地UI状态管理
// 数据获取和更新现在由 React Query 处理
interface UserUIState {
  // UI 相关状态
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  lastActiveTab: string;
}

interface UserUIActions {
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLastActiveTab: (tab: string) => void;
  resetUIState: () => void;
}

type UserUIStore = UserUIState & UserUIActions;

// 将store重命名为更明确的用途
export const useUserUIStore = create<UserUIStore>()(
  persist(
    (set) => ({
      // State
      sidebarCollapsed: false,
      theme: 'light',
      lastActiveTab: 'profile',

      // Actions
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      setLastActiveTab: (tab) => {
        set({ lastActiveTab: tab });
      },

      resetUIState: () => {
        set({
          sidebarCollapsed: false,
          theme: 'light',
          lastActiveTab: 'profile',
        });
      },
    }),
    {
      name: 'user-ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        lastActiveTab: state.lastActiveTab,
      }),
    },
  ),
);

// 保持向后兼容性的别名 - 但现在主要用于UI状态
export const useUserStore = useUserUIStore;
