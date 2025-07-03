import { useMemo, useState, useCallback } from 'react';

import {
  createRootComment,
  getComments,
  getReplies,
  createReply,
  deleteComment as apiDeleteComment,
} from '@/services/comment';
import { CreateCommentPayload, IGetCommentsParams } from '@/services/comment/type';

// 为了兼容现有的本地Comment类型，我们创建一个扩展的Comment类型
export type Comment = {
  id: string;
  text: string;
  selectedText: string;
  timestamp: Date;
  author?: string;
  position?: { from: number; to: number };
  commentId?: string; // 用于关联评论标记
  // API相关字段
  markId?: string;
  apiId?: number; // 来自API的评论ID
  documentId?: number;
};

export type CommentSidebarState = {
  isOpen: boolean;
  comments: Comment[];
  replies: { [commentId: string]: Comment[] };
  currentSelection: string;
  loading: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addComment: (
    text: string,
    selectedText: string,
    position?: { from: number; to: number },
    commentId?: string,
  ) => Promise<void>;
  removeComment: (id: string) => void;
  setCurrentSelection: (text: string) => void;
  loadComments: (markId: string) => Promise<void>;
  loadReplies: (commentId: string) => Promise<void>;
  addReply: (commentId: string, content: string) => Promise<void>;
  setReplyInput: (commentId: string, value: string) => void;
  replyInput: { [commentId: string]: string };
};

export const useCommentSidebar = (documentId?: string): CommentSidebarState => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 新增：回复相关 state
  const [replies, setReplies] = useState<{ [commentId: string]: Comment[] }>({});
  const [replyInput, setReplyInput] = useState<{ [commentId: string]: string }>({});

  const addComment = useCallback(
    async (
      text: string,
      selectedText: string,
      position?: { from: number; to: number },
      commentId?: string,
    ) => {
      if (!documentId) {
        console.error('文档ID不存在，无法创建评论');

        return;
      }

      setLoading(true);

      try {
        // 生成mark_id，用于标识评论在文档中的位置
        const markId = commentId || `comment-${Date.now()}`;

        // 构建API请求数据
        const payload: CreateCommentPayload = {
          content: text,
          mark_id: markId,
          selected_text: selectedText,
        };

        console.log('🚀 创建评论API调用：', {
          documentId,
          payload,
          position,
        });

        // 调用API创建评论
        const response = await createRootComment(payload, documentId);

        console.log('✅ 评论创建成功：', response);

        // 检查响应数据
        if (!response.data?.data) {
          throw new Error('API响应数据为空');
        }

        // 将API返回的评论数据转换为本地评论格式
        const apiComment = response.data.data;
        const newComment: Comment = {
          id: apiComment.id.toString(),
          text: apiComment.content,
          selectedText: apiComment.selection?.text || selectedText,
          timestamp: new Date(apiComment.created_at),
          author: apiComment.author.name,
          position,
          commentId: markId,
          markId: apiComment.mark_id,
          apiId: apiComment.id, // 保存API返回的评论ID
          documentId: apiComment.document_id,
        };

        setComments((prev) => [...prev, newComment]);

        console.log('✅ 评论已添加到本地状态');
      } catch (error) {
        console.error('❌ 创建评论失败：', error);
        // 这里可以添加错误提示，比如toast通知
      } finally {
        setLoading(false);
      }
    },
    [documentId],
  );

  const removeComment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // 调用后端API删除评论
      await apiDeleteComment(id);
      // 删除本地状态中的评论
      setComments((prev) => prev.filter((comment) => comment.id !== id));
      // 同时移除该评论的所有回复
      setReplies((prev) => {
        const newReplies = { ...prev };
        delete newReplies[id];

        return newReplies;
      });
      // 可选：移除回复输入框内容
      setReplyInput((prev) => {
        const newInput = { ...prev };
        delete newInput[id];

        return newInput;
      });
    } catch (error) {
      console.error('❌ 删除评论失败：', error);
      // 这里可以添加错误提示，比如toast通知
    } finally {
      setLoading(false);
    }
  }, []);

  // 根据maid加载评论
  const loadComments = useCallback(
    async (markId: string) => {
      // 如果markId为空，清空评论列表
      if (!markId.trim()) {
        console.log('📝 清空评论列表');
        setComments([]);

        return;
      }

      if (!documentId) {
        console.error('文档ID不存在，无法加载评论');

        return;
      }

      setLoading(true);

      try {
        const params: IGetCommentsParams = {
          mark_id: markId,
          page: 1,
          page_size: 50,
          include_resolved: true,
        };

        console.log('🔄 获取评论API调用：', {
          documentId,
          params,
        });

        const response = await getComments(documentId, params);

        console.log('✅ 评论获取成功：', response);

        if (response.data?.data?.comments && response.data.data.comments.length > 0) {
          // 将API返回的评论数据转换为本地评论格式
          const apiComments = response.data.data.comments;
          console.log('🔄 转换API评论数据：', apiComments);

          const localComments: Comment[] = apiComments.map((apiComment) => {
            const selectedText = apiComment.selection?.text || '';
            const localComment = {
              id: apiComment.id.toString(), // 转换为字符串ID
              text: apiComment.content,
              selectedText: selectedText, // 使用API返回的选中文本
              timestamp: new Date(apiComment.created_at),
              author: apiComment.author.name,
              position: apiComment.selection?.range
                ? {
                    from: apiComment.selection.range.from,
                    to: apiComment.selection.range.to,
                  }
                : undefined,
              commentId: apiComment.mark_id,
              markId: apiComment.mark_id,
              apiId: apiComment.id,
              documentId: apiComment.document_id,
            };

            console.log('📝 转换后的评论:', {
              id: localComment.id,
              text: localComment.text,
              selectedText: `"${localComment.selectedText}"`,
              author: localComment.author,
              markId: localComment.markId,
            });

            return localComment;
          });

          setComments(localComments);
          console.log('✅ 评论已加载到本地状态，共', localComments.length, '条');
          console.log('📋 完整的评论列表:', localComments);

          // 新增：自动为每条评论加载回复并保存到本地
          apiComments.forEach(async (apiComment) => {
            const commentId = apiComment.id.toString();
            const res = await getReplies(commentId, { page: 1, page_size: 20 });

            if (res.data?.data?.comments) {
              const apiReplies = res.data.data.comments;
              const localReplies: Comment[] = apiReplies.map((apiComment) => ({
                id: apiComment.id.toString(),
                text: apiComment.content,
                selectedText: apiComment.selection?.text || '',
                timestamp: new Date(apiComment.created_at),
                author: apiComment.author.name,
                position: apiComment.selection?.range
                  ? {
                      from: apiComment.selection.range.from,
                      to: apiComment.selection.range.to,
                    }
                  : undefined,
                commentId: apiComment.mark_id,
                markId: apiComment.mark_id,
                apiId: apiComment.id,
                documentId: apiComment.document_id,
              }));
              setReplies((prev) => ({
                ...prev,
                [commentId]: localReplies,
              }));
            }
          });
        } else {
          console.log('📝 该mark_id没有评论');
          setComments([]);
        }

        console.log('后端返回的评论:', response.data?.data?.comments);
      } catch (error) {
        console.error('❌ 获取评论失败：', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    },
    [documentId],
  );

  // 创建稳定的 setCurrentSelection 函数
  const setCurrentSelectionStable = useCallback((text: string) => {
    console.log('🔄 设置当前选择:', text);
    setCurrentSelection(text);
  }, []);

  // 加载回复
  const loadReplies = useCallback(async (commentId: string) => {
    if (!commentId) return;
    setLoading(true);

    try {
      const res = await getReplies(commentId, { page: 1, page_size: 20 });

      if (res.data?.data?.comments) {
        const apiReplies = res.data.data.comments;
        const localReplies: Comment[] = apiReplies.map((apiComment) => ({
          id: apiComment.id.toString(),
          text: apiComment.content,
          selectedText: apiComment.selection?.text || '',
          timestamp: new Date(apiComment.created_at),
          author: apiComment.author.name,
          position: apiComment.selection?.range
            ? {
                from: apiComment.selection.range.from,
                to: apiComment.selection.range.to,
              }
            : undefined,
          commentId: apiComment.mark_id,
          markId: apiComment.mark_id,
          apiId: apiComment.id,
          documentId: apiComment.document_id,
        }));
        setReplies((prev) => ({ ...prev, [commentId]: localReplies }));
      } else {
        setReplies((prev) => ({ ...prev, [commentId]: [] }));
      }
    } catch (error) {
      console.error('❌ 获取回复失败：', error);
      // setReplies((prev) => ({ ...prev, [commentId]: [] }));
    } finally {
      setLoading(false);
    }
  }, []);

  // 添加回复
  const addReply = useCallback(async (commentId: string, content: string) => {
    if (!commentId || !content.trim()) return;
    setLoading(true);

    try {
      const res = await createReply(commentId, { content });
      const apiReply = res.data?.data;

      if (apiReply) {
        const newReply: Comment = {
          id: apiReply.id.toString(),
          text: apiReply.content,
          selectedText: apiReply.selection?.text || '',
          timestamp: new Date(apiReply.created_at),
          author: apiReply.author.name,
          position: apiReply.selection?.range
            ? {
                from: apiReply.selection.range.from,
                to: apiReply.selection.range.to,
              }
            : undefined,
          commentId: apiReply.mark_id,
          markId: apiReply.mark_id,
          apiId: apiReply.id,
          documentId: apiReply.document_id,
        };
        setReplies((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), newReply],
        }));
        setReplyInput((prev) => ({ ...prev, [commentId]: '' }));
        // 不需要 await loadReplies(commentId)
      }
    } catch (error) {
      console.error('❌ 添加回复失败：', error);
      // 错误处理
    } finally {
      setLoading(false);
    }
  }, []);

  // 设置回复输入内容
  const setReplyInputHandler = useCallback((commentId: string, value: string) => {
    setReplyInput((prev) => ({ ...prev, [commentId]: value }));
  }, []);

  return useMemo(() => {
    return {
      isOpen,
      comments,
      replies,
      currentSelection,
      loading,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
      addComment,
      removeComment,
      setCurrentSelection: setCurrentSelectionStable,
      loadComments,
      replyInput,
      loadReplies,
      addReply,
      setReplyInput: setReplyInputHandler,
    };
  }, [
    isOpen,
    comments,
    replies,
    currentSelection,
    loading,
    addComment,
    removeComment,
    setCurrentSelectionStable,
    replyInput,
    loadReplies,
    addReply,
    setReplyInputHandler,
  ]);
};
