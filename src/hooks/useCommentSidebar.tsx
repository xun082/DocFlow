import { useMemo, useState, useCallback } from 'react';

import { createRootComment, getComments } from '@/services/comment';
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
};

export const useCommentSidebar = (documentId?: string): CommentSidebarState => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentSelection, setCurrentSelection] = useState('');
  const [loading, setLoading] = useState(false);

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
          id: Date.now().toString(), // 本地ID，用于UI操作
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

  const removeComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
    // TODO: 这里应该调用删除评论的API
  }, []);

  // 根据mark_id加载评论
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
        } else {
          console.log('📝 该mark_id没有评论');
          setComments([]);
        }
      } catch (error) {
        console.error('❌ 获取评论失败：', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    },
    [documentId],
  );

  return useMemo(() => {
    return {
      isOpen,
      comments,
      currentSelection,
      loading,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
      addComment,
      removeComment,
      setCurrentSelection,
      loadComments,
    };
  }, [isOpen, comments, currentSelection, loading, addComment, removeComment, loadComments]);
};
