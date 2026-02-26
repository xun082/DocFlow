import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatTab {
  id: string;
  title: string;
  conversationId: string | null;
}

export interface DocumentReference {
  fileName: string;
  startLine: number;
  endLine: number;
  content: string;
  charCount: number;
}

interface ChatState {
  isOpen: boolean;
  tabs: ChatTab[];
  activeTabId: string | null;
  documentReference: DocumentReference | null;
  presetMessage: string | null;

  setIsOpen: (isOpen: boolean) => void;
  togglePanel: () => void;
  addTab: (tab?: Partial<Omit<ChatTab, 'id'>>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Omit<ChatTab, 'id'>>) => void;
  setDocumentReference: (reference: DocumentReference | null) => void;
  setPresetMessage: (message: string | null) => void;
  onRenameTab: (id: string, newTitle: string) => void;
}

let tabCounter = 0;

function createTabId(): string {
  tabCounter += 1;

  return `tab-${tabCounter}-${Date.now()}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: true,
      tabs: [],
      activeTabId: null,
      documentReference: null,
      presetMessage: null,

      setIsOpen: (isOpen) => {
        set((state) => {
          if (isOpen && state.tabs.length === 0) {
            const id = createTabId();
            const newTab: ChatTab = {
              id,
              title: '新对话',
              conversationId: null,
            };

            return {
              isOpen,
              tabs: [newTab],
              activeTabId: id,
            };
          }

          return { isOpen };
        });
      },

      togglePanel: () => {
        set((state) => {
          const next = !state.isOpen;

          if (next && state.tabs.length === 0) {
            const id = createTabId();
            const newTab: ChatTab = {
              id,
              title: '新对话',
              conversationId: null,
            };

            return {
              isOpen: next,
              tabs: [newTab],
              activeTabId: id,
            };
          }

          return { isOpen: next };
        });
      },

      addTab: (tab) => {
        const id = createTabId();
        const newTab: ChatTab = {
          id,
          title: tab?.title || '新对话',
          conversationId: tab?.conversationId || null,
        };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
        }));

        return id;
      },

      removeTab: (id) => {
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === id) {
            const removedIndex = state.tabs.findIndex((t) => t.id === id);

            if (newTabs.length > 0) {
              newActiveId = newTabs[Math.min(removedIndex, newTabs.length - 1)].id;
            } else {
              newActiveId = null;
            }
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveId,
            isOpen: newTabs.length > 0 ? state.isOpen : false,
          };
        });
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTab: (id, updates) =>
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      onRenameTab: (id, newTitle) =>
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, title: newTitle } : t)),
        })),

      setDocumentReference: (reference) => set({ documentReference: reference }),

      setPresetMessage: (message) => set({ presetMessage: message }),
    }),
    {
      name: 'chat-storage',
    },
  ),
);
