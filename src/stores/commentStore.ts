import { create } from 'zustand';

interface CommentState {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  selectedText: string;
  openComment: (position: { x: number; y: number }, selectedText?: string) => void;
  closeComment: () => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  isOpen: false,
  position: null,
  selectedText: '',
  openComment: (position, selectedText = '') =>
    set({
      isOpen: true,
      position,
      selectedText,
    }),
  closeComment: () =>
    set({
      isOpen: false,
      position: null,
      selectedText: '',
    }),
}));
