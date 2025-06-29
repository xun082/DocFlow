export interface ReturnResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface CreateCommentPayload {
  content: string; //评论内容
  mark_id: string; //TipTap标记id
  selected_text?: string; //选中的文本内容
}

export interface Selection {
  text: string;
  range: {
    from: number;
    to: number;
  };
}

export interface Comment {
  id: number; //评论id
  document_id: number; //文档id
  author_id: number; //作者id
  content: string; //评论内容
  mark_id: string; //TipTap标记id
  selection: Selection | null; //选区数据
  parent_id: number | null; //父评论id
  is_root: boolean; //是否为根评论
  resolved: boolean; //是否已解决
  reply_count?: number; //回复数量
  created_at: string; //创建时间
  updated_at: string; //更新时间
  author: Author; //作者信息
}

/**
 * 作者信息的数据结构
 */
export interface Author {
  id: number; //作者id
  name: string; //作者名称
  email: string; //作者邮箱
  avatar_url: string; //作者头像
}

//获取评论列表的参数
export interface IGetCommentsParams {
  mark_id?: string;
  page: number;
  page_size: number;
  include_resolved?: boolean;
}

//获取回复列表的参数
export interface IGetRepliesParams {
  page?: number; //页码
  page_size?: number; //每页条数
}

//创建回复的参数
export interface ICreateReplyPayload {
  content: string;
}

//更新评论的参数
export interface IUpdateCommentPayload {
  content?: string;
  resolved?: boolean;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface GetCommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

//删除评论的响应参数
export interface DeleteCommentResponse {
  message: string;
  deleted_count: number;
}
