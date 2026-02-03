import { create } from 'zustand';

import type { CommentThread } from '@/services/comment/type';

interface CommentState {
  // UI 状态
  isOpen: boolean;
  isPanelOpen: boolean;
  isCreatingNewComment: boolean;

  // 评论数据
  comments: CommentThread[];
  activeCommentId: string | null;
  hoveredCommentId: string | null;

  // UI 操作
  openComment: () => void;
  closeComment: () => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setIsCreatingNewComment: (value: boolean) => void;

  // 评论数据操作
  setComments: (comments: CommentThread[]) => void;
  addComment: (comment: CommentThread) => void;
  updateComment: (id: string, updates: Partial<CommentThread>) => void;
  deleteComment: (id: string) => void;
  setActiveCommentId: (id: string | null) => void;
  setHoveredCommentId: (id: string | null) => void;

  // 获取特定评论
  getCommentByCommentId: (commentId: string) => CommentThread | undefined;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  // 初始状态
  isOpen: false,
  isPanelOpen: false,
  isCreatingNewComment: false,
  comments: [],
  activeCommentId: null,
  hoveredCommentId: null,

  // UI 操作
  openComment: () =>
    set({
      isOpen: true,
    }),

  closeComment: () =>
    set({
      isOpen: false,
    }),

  openPanel: () =>
    set({
      isPanelOpen: true,
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      isCreatingNewComment: false,
    }),

  togglePanel: () =>
    set((state) => ({
      isPanelOpen: !state.isPanelOpen,
      isCreatingNewComment: false,
    })),

  setIsCreatingNewComment: (value) =>
    set({
      isCreatingNewComment: value,
    }),

  // 评论数据操作
  setComments: (comments) =>
    set({
      comments,
    }),

  addComment: (comment) =>
    set((state) => ({
      comments: [...state.comments, comment],
    })),

  updateComment: (id, updates) =>
    set((state) => ({
      comments: state.comments.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
    })),

  setActiveCommentId: (id) =>
    set({
      activeCommentId: id,
    }),

  setHoveredCommentId: (id) =>
    set({
      hoveredCommentId: id,
    }),

  // 获取特定评论
  getCommentByCommentId: (commentId) => {
    return get().comments.find((c) => c.commentId === commentId);
  },
}));
