import request from '../request';
import {
  ReturnResponse,
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
export const createRootComment = (payload: CreateCommentPayload, documentId: number) => {
  return request.post<ReturnResponse<Comment>>(`/api/v1/comments/documents/${documentId}`, {
    params: payload,
  });
};

//获取评论的回复列表（分页）
export const getReplies = (commentId: number, params: IGetRepliesParams) => {
  return request.get<ReturnResponse<GetCommentsResponse>>(`/api/v1/comments/${commentId}/replies`, {
    params,
  });
};

// 回复评论
export const createReply = (commentId: number, payload: ICreateReplyPayload) => {
  return request.post<ReturnResponse<Comment>>(`/api/v1/comments/${commentId}/replies`, {
    params: payload,
  });
};

//获取评论列表
export const getComments = (documentId: number, payload: IGetCommentsParams) => {
  return request.get<ReturnResponse<GetCommentsResponse>>(`/api/v1/documents/${documentId}`, {
    params: payload,
  });
};

//更新评论
export const updateComment = (commentId: number, payload: IUpdateCommentPayload) => {
  return request.put<ReturnResponse<Comment>>(`/api/v1/comments/${commentId}`, { params: payload });
};

//删除评论
export const deleteComment = (commentId: number) => {
  return request.delete<ReturnResponse<DeleteCommentResponse>>(`/api/v1/comments/${commentId}`);
};
