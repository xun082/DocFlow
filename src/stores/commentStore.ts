import { create } from 'zustand';

interface CommentState {
  isOpen: boolean;
  openComment: () => void;
  closeComment: () => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  isOpen: false,
  openComment: () =>
    set({
      isOpen: true,
    }),

  closeComment: () =>
    set({
      isOpen: false,
    }),
}));
