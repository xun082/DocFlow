import request from '../request';
import { BlogPost, GetAllBlogsParams, CreateBlogParams } from './type';

export const blogsApi = {
  /**
   * 获取所有博客
   *
   * @returns 博客列表
   */
  getAll: (params: GetAllBlogsParams) =>
    request.post<BlogPost[]>('/api/v1/blog/all', {
      params: params,
    }),

  getBlogInfo: (id: number) => request.get<BlogPost>(`/api/v1/blog/info/${id}`),

  createBlog: (data: CreateBlogParams) =>
    request.post<BlogPost>('/api/v1/blog/create', { params: data }),
};
