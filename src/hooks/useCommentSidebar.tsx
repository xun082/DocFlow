import { useState, useCallback } from 'react';

import { getComments, createRootComment, deleteComment } from '@/services/comment';
import { Comment, CreateCommentPayload } from '@/services/comment/type';
import type { GetCommentsResponse } from '@/services/comment/type';

export type CommentSidebarState = {
  isOpen: boolean;
  comments: Comment[];
  currentSelection: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addComment: (payload: CreateCommentPayload) => void;
  removeComment: (id: number) => void;
  setCurrentSelection: (text: string) => void;
  loading: boolean;
  fetchComments: (mark_id?: string, page?: number, page_size?: number) => Promise<void>;
};

export const useCommentSidebar = (documentId: number): CommentSidebarState => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentSelection, setCurrentSelection] = useState('');
  const [loading, setLoading] = useState(false);

  // 加载评论
  const fetchComments = useCallback(
    async (mark_id?: string, page = 1, page_size = 100) => {
      setLoading(true);

      try {
        const params: any = { page, page_size };

        if (mark_id) {
          params.mark_id = mark_id;
        }

        const res = await getComments(documentId, params);

        if (res && res.data && res.data.data) {
          setComments((res.data.data as unknown as GetCommentsResponse).comments);
        }
      } catch (error) {
        console.error('获取评论列表失败:', error);
      } finally {
        setLoading(false);
      }
    },
    [documentId],
  );

  // 添加评论
  const addComment = useCallback(
    async (payload: CreateCommentPayload) => {
      setLoading(true);

      try {
        const res = await createRootComment(payload, documentId);

        if (res?.data?.data) {
          // 创建成功后，重新获取评论列表确保数据同步
          await fetchComments();
        }
      } catch (error) {
        console.error('添加评论失败:', error);
      } finally {
        setLoading(false);
      }
    },
    [documentId, fetchComments],
  );

  // 删除评论
  const removeComment = useCallback(async (commentId: number) => {
    setLoading(true);
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setLoading(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setCurrentSelectionCallback = useCallback((text: string) => {
    setCurrentSelection(text);
  }, []);

  // 移除 useMemo，直接返回对象，避免每次 comments 更新时都重新创建
  return {
    isOpen,
    comments,
    currentSelection,
    open,
    close,
    toggle,
    addComment,
    removeComment,
    setCurrentSelection: setCurrentSelectionCallback,
    loading,
    fetchComments,
  };
};
