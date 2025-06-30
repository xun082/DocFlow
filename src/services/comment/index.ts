import request from '../request';
import {
  CreateCommentPayload,
  Comment,
  IGetCommentsParams,
  IGetRepliesParams,
  ICreateReplyPayload,
  IUpdateCommentPayload,
  GetCommentsResponse,
  DeleteCommentResponse,
} from './type';

//创建根评论
export const createRootComment = (payload: CreateCommentPayload, documentId: string) => {
  return request.post<Comment>(`/api/v1/comments/documents/${documentId}`, { params: payload });
};

//根据mark_id获取评论列表（分页）
export const getComments = (documentId: string, params: IGetCommentsParams) => {
  return request.get<GetCommentsResponse>(`/api/v1/comments/documents/${documentId}`, {
    params,
  });
};

//获取评论的回复列表（分页）
export const getReplies = (commentId: string, params: IGetRepliesParams) => {
  return request.get<GetCommentsResponse>(`/api/v1/comments/${commentId}/replies`, { params });
};

// 回复评论
export const createReply = (commentId: string, payload: ICreateReplyPayload) => {
  return request.post<Comment>(`/api/v1/comments/${commentId}/replies`, {
    params: payload,
  });
};

//获取单个评论详情
export const getCommentDetail = (commentId: string) => {
  return request.get<Comment>(`/api/v1/comments/${commentId}`);
};

//更新评论
export const updateComment = (commentId: string, payload: IUpdateCommentPayload) => {
  return request.put<Comment>(`/api/v1/comments/${commentId}`, { params: payload });
};

//删除评论
export const deleteComment = (commentId: string) => {
  return request.delete<DeleteCommentResponse>(`/api/v1/comments/${commentId}`);
};
