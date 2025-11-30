// 评论相关类型定义

/**
 * 评论数据
 */
export interface CommentThread {
  id: string;
  documentId: string;
  commentId: string; // 对应编辑器中的 commentId
  text: string; // 被评论的文本
  from: number; // 起始位置
  to: number; // 结束位置
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  replies: CommentReply[];
  resolved: boolean;
}

/**
 * 评论回复
 */
export interface CommentReply {
  id: string;
  threadId: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

/**
 * 创建评论的请求
 */
export interface CreateCommentRequest {
  documentId: string;
  commentId: string;
  text: string;
  from: number;
  to: number;
  content: string;
}

/**
 * 创建回复的请求
 */
export interface CreateReplyRequest {
  threadId: string;
  content: string;
}

/**
 * 更新评论的请求
 */
export interface UpdateCommentRequest {
  id: string;
  resolved?: boolean;
}

/**
 * 删除评论的请求
 */
export interface DeleteCommentRequest {
  id: string;
}

/**
 * 删除回复的请求
 */
export interface DeleteReplyRequest {
  id: string;
}

/**
 * 获取文档评论列表的响应
 */
export interface GetCommentsResponse {
  comments: CommentThread[];
}
