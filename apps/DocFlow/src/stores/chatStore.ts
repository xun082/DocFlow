import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  togglePanel: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: true,

  setIsOpen: (isOpen) => set({ isOpen }),

  togglePanel: () => set({ isOpen: !get().isOpen }),
}));
