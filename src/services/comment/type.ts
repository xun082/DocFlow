// 评论相关类型定义

/**
 * 后端返回的评论数据
 */
export interface CommentApiResponse {
  id: number;
  document_id: number;
  author_id: number;
  content: string;
  mark_id: string;
  selection: {
    text: string;
  } | null;
  parent_id: number | null;
  is_root: boolean;
  resolved: boolean;
  reply_count?: number;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

/**
 * 评论数据（前端使用）
 */
export interface CommentThread {
  id: string;
  documentId: string;
  commentId: string; // 评论标记 ID (mark_id)，对应编辑器中的 comment mark
  text: string; // 被评论的文本
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
  commentId: string; // 评论标记 ID (mark_id)
  text: string; // 被评论的文本内容
  content: string; // 评论内容
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
export interface GetCommentsApiResponse {
  comments: CommentApiResponse[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
