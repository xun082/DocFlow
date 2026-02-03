import request from '../request';
import type {
  CommentThread,
  CreateCommentRequest,
  CreateReplyRequest,
  UpdateCommentRequest,
  DeleteCommentRequest,
  DeleteReplyRequest,
  CommentReply,
  CommentApiResponse,
  GetCommentsApiResponse,
} from './type';

/**
 * 将后端评论数据转换为前端格式
 */
function transformApiResponseToThread(
  rootComment: CommentApiResponse,
  replies: CommentApiResponse[],
): CommentThread {
  // 将根评论的内容作为第一条回复
  const allReplies: CommentReply[] = [
    {
      id: String(rootComment.id),
      threadId: String(rootComment.id),
      content: rootComment.content,
      createdAt: rootComment.created_at,
      userId: String(rootComment.author_id),
      userName: rootComment.author.name,
      userAvatar: rootComment.author.avatar_url || undefined,
    },
    ...replies.map((reply) => ({
      id: String(reply.id),
      threadId: String(rootComment.id),
      content: reply.content,
      createdAt: reply.created_at,
      userId: String(reply.author_id),
      userName: reply.author.name,
      userAvatar: reply.author.avatar_url || undefined,
    })),
  ];

  return {
    id: String(rootComment.id),
    documentId: String(rootComment.document_id),
    commentId: rootComment.mark_id,
    text: rootComment.selection?.text || '',
    createdAt: rootComment.created_at,
    updatedAt: rootComment.updated_at,
    userId: String(rootComment.author_id),
    userName: rootComment.author.name,
    userAvatar: rootComment.author.avatar_url || undefined,
    resolved: rootComment.resolved,
    replies: allReplies,
  };
}

/**
 * 评论服务 API
 */
class CommentApi {
  /**
   * 获取文档的所有评论
   */
  async getComments(documentId: string): Promise<CommentThread[]> {
    const { data, error } = await request.get<GetCommentsApiResponse>(
      `/api/v1/comments/documents/${documentId}`,
      {
        params: {
          page: 1,
          page_size: 100,
        },
        cacheTime: 0, // 禁用请求库缓存
      },
    );

    if (error || !data?.data) {
      console.error('获取评论失败:', error);

      return [];
    }

    const comments = data.data.comments;

    // 按 mark_id 分组
    const commentsByMarkId = new Map<string, CommentApiResponse[]>();

    comments.forEach((comment) => {
      const markId = comment.mark_id;

      if (!commentsByMarkId.has(markId)) {
        commentsByMarkId.set(markId, []);
      }

      commentsByMarkId.get(markId)!.push(comment);
    });

    // 转换为 CommentThread 格式
    const threads: CommentThread[] = [];

    commentsByMarkId.forEach((commentsGroup) => {
      // 找到根评论
      const rootComment = commentsGroup.find((c) => c.is_root);

      if (!rootComment) return;

      // 找到所有回复
      const replies = commentsGroup.filter((c) => !c.is_root);

      threads.push(transformApiResponseToThread(rootComment, replies));
    });

    return threads;
  }

  /**
   * 创建评论
   */
  async createComment(data: CreateCommentRequest): Promise<CommentThread> {
    const { data: response, error } = await request.post<CommentApiResponse>(
      `/api/v1/comments/documents/${data.documentId}`,
      {
        params: {
          content: data.content,
          mark_id: data.commentId,
          selected_text: data.text,
        },
      },
    );

    if (error || !response?.data) {
      throw new Error(error || '创建评论失败');
    }

    const apiComment = response.data;

    // 转换为前端格式
    return transformApiResponseToThread(apiComment, []);
  }

  /**
   * 更新评论（标记为已解决）
   */
  async updateComment(data: UpdateCommentRequest): Promise<CommentThread> {
    const { data: response, error } = await request.patch<CommentApiResponse>(
      `/api/v1/comments/${data.id}/resolve`,
      {
        params: {
          resolved: data.resolved ?? true,
        },
      },
    );

    if (error || !response?.data) {
      throw new Error(error || '更新评论失败');
    }

    const apiComment = response.data;

    // 转换为前端格式（没有回复信息，需要额外获取）
    return transformApiResponseToThread(apiComment, []);
  }

  /**
   * 删除评论
   */
  async deleteComment(data: DeleteCommentRequest): Promise<void> {
    const { error } = await request.delete<void>(`/api/v1/comments/${data.id}`);

    if (error) {
      throw new Error(error);
    }
  }

  /**
   * 创建回复
   */
  async createReply(data: CreateReplyRequest): Promise<CommentReply> {
    const { data: response, error } = await request.post<CommentApiResponse>(
      `/api/v1/comments/${data.threadId}/replies`,
      {
        params: {
          content: data.content,
        },
      },
    );

    if (error || !response?.data) {
      throw new Error(error || '创建回复失败');
    }

    const apiReply = response.data;

    // 转换为前端格式
    return {
      id: String(apiReply.id),
      threadId: String(apiReply.parent_id),
      content: apiReply.content,
      createdAt: apiReply.created_at,
      userId: String(apiReply.author_id),
      userName: apiReply.author.name,
      userAvatar: apiReply.author.avatar_url || undefined,
    };
  }

  /**
   * 删除回复
   */
  async deleteReply(data: DeleteReplyRequest): Promise<void> {
    const { error } = await request.delete<void>(`/api/v1/comments/${data.id}`);

    if (error) {
      throw new Error(error);
    }
  }
}

export default new CommentApi();
