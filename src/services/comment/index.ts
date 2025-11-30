import type {
  CommentThread,
  CreateCommentRequest,
  CreateReplyRequest,
  UpdateCommentRequest,
  DeleteCommentRequest,
  DeleteReplyRequest,
  CommentReply,
} from './type';

// 本地存储的键名
const STORAGE_KEY = 'docflow_comments';

// 从本地存储获取所有评论
function getCommentsFromStorage(): Record<string, CommentThread[]> {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem(STORAGE_KEY);

  return stored ? JSON.parse(stored) : {};
}

// 保存评论到本地存储
function saveCommentsToStorage(comments: Record<string, CommentThread[]>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 获取当前用户信息（模拟）
function getCurrentUser() {
  return {
    id: 'user-1',
    name: '当前用户',
    avatar: undefined,
  };
}

/**
 * 评论服务 API - 本地存储版本
 */
class CommentApi {
  /**
   * 获取文档的所有评论
   */
  async getComments(documentId: string): Promise<CommentThread[]> {
    const allComments = getCommentsFromStorage();

    return allComments[documentId] || [];
  }

  /**
   * 创建评论
   */
  async createComment(
    data: CreateCommentRequest,
    user?: { id: string; name: string; avatar?: string },
  ): Promise<CommentThread> {
    const currentUser = user || getCurrentUser();
    const now = new Date().toISOString();

    const newThread: CommentThread = {
      id: generateId(),
      documentId: data.documentId,
      commentId: data.commentId,
      text: data.text,
      from: data.from,
      to: data.to,
      createdAt: now,
      updatedAt: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      replies: [
        {
          id: generateId(),
          threadId: '',
          content: data.content,
          createdAt: now,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
        },
      ],
      resolved: false,
    };

    newThread.replies[0].threadId = newThread.id;

    const allComments = getCommentsFromStorage();
    const docComments = allComments[data.documentId] || [];
    docComments.push(newThread);
    allComments[data.documentId] = docComments;
    saveCommentsToStorage(allComments);

    return newThread;
  }

  /**
   * 更新评论（例如标记为已解决）
   */
  async updateComment(data: UpdateCommentRequest): Promise<CommentThread> {
    const allComments = getCommentsFromStorage();

    for (const documentId in allComments) {
      const docComments = allComments[documentId];
      const commentIndex = docComments.findIndex((c) => c.id === data.id);

      if (commentIndex !== -1) {
        docComments[commentIndex] = {
          ...docComments[commentIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        saveCommentsToStorage(allComments);

        return docComments[commentIndex];
      }
    }

    throw new Error('Comment not found');
  }

  /**
   * 删除评论
   */
  async deleteComment(data: DeleteCommentRequest): Promise<void> {
    const allComments = getCommentsFromStorage();

    for (const documentId in allComments) {
      const docComments = allComments[documentId];
      const newComments = docComments.filter((c) => c.id !== data.id);

      if (newComments.length !== docComments.length) {
        allComments[documentId] = newComments;
        saveCommentsToStorage(allComments);

        return;
      }
    }
  }

  /**
   * 创建回复
   */
  async createReply(
    data: CreateReplyRequest,
    user?: { id: string; name: string; avatar?: string },
  ): Promise<CommentReply> {
    const currentUser = user || getCurrentUser();
    const now = new Date().toISOString();

    const newReply: CommentReply = {
      id: generateId(),
      threadId: data.threadId,
      content: data.content,
      createdAt: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
    };

    const allComments = getCommentsFromStorage();

    for (const documentId in allComments) {
      const docComments = allComments[documentId];
      const thread = docComments.find((c) => c.id === data.threadId);

      if (thread) {
        thread.replies.push(newReply);
        thread.updatedAt = now;
        saveCommentsToStorage(allComments);

        return newReply;
      }
    }

    throw new Error('Thread not found');
  }

  /**
   * 删除回复
   */
  async deleteReply(data: DeleteReplyRequest): Promise<void> {
    const allComments = getCommentsFromStorage();

    for (const documentId in allComments) {
      const docComments = allComments[documentId];

      for (const thread of docComments) {
        const replyIndex = thread.replies.findIndex((r) => r.id === data.id);

        if (replyIndex !== -1) {
          thread.replies.splice(replyIndex, 1);
          thread.updatedAt = new Date().toISOString();
          saveCommentsToStorage(allComments);

          return;
        }
      }
    }
  }
}

export default new CommentApi();
