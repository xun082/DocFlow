import { serverRequest, clientRequest } from '../request';
import type { BlogPost, GetAllBlogsParams, CreateBlogParams } from './type';

/**
 * 博客服务端 API（用于服务端组件，无需认证）
 */
export const blogsServerApi = {
  /** 获取所有博客列表 */
  getAll: (params?: GetAllBlogsParams) =>
    serverRequest.post<BlogPost[]>('/api/v1/blog/all', { params }),

  /** 获取博客详情 */
  getInfo: (id: number) => serverRequest.get<BlogPost>(`/api/v1/blog/info/${id}`),
};

/**
 * 博客客户端 API（用于客户端组件，需要认证）
 */
export const blogsClientApi = {
  /** 获取所有博客列表 */
  getAll: (params?: GetAllBlogsParams) =>
    clientRequest.post<BlogPost[]>('/api/v1/blog/all', { params }),

  /** 获取博客详情 */
  getInfo: (id: number) => clientRequest.get<BlogPost>(`/api/v1/blog/info/${id}`),

  /** 创建博客 */
  create: (data: CreateBlogParams) =>
    clientRequest.post<BlogPost>('/api/v1/blog/create', { params: data }),
};
