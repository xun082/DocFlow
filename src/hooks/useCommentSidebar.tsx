import { useMemo, useState, useCallback } from 'react';

export type Comment = {
  id: string;
  text: string;
  selectedText: string;
  timestamp: Date;
  author?: string;
  position?: { from: number; to: number };
  commentId?: string; // 用于关联评论标记
};

export type CommentSidebarState = {
  isOpen: boolean;
  comments: Comment[];
  currentSelection: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addComment: (
    text: string,
    selectedText: string,
    position?: { from: number; to: number },
    commentId?: string,
  ) => void;
  removeComment: (id: string) => void;
  setCurrentSelection: (text: string) => void;
};

export const useCommentSidebar = (): CommentSidebarState => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentSelection, setCurrentSelection] = useState('');

  const addComment = useCallback(
    (
      text: string,
      selectedText: string,
      position?: { from: number; to: number },
      commentId?: string,
    ) => {
      const newComment: Comment = {
        id: Date.now().toString(),
        text,
        selectedText,
        timestamp: new Date(),
        author: '当前用户', // 这里可以替换为实际的用户信息
        position,
        commentId: commentId || Date.now().toString(), // 如果没有提供commentId，使用时间戳
      };
      setComments((prev) => [...prev, newComment]);
    },
    [],
  );

  const removeComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  }, []);

  return useMemo(() => {
    return {
      isOpen,
      comments,
      currentSelection,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
      addComment,
      removeComment,
      setCurrentSelection,
    };
  }, [isOpen, comments, currentSelection, addComment, removeComment]);
};
