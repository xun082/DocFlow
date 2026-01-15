import request, { ErrorHandler } from '../request';
import { BlogPost } from './type';

export const blogsApi = {
  /**
   * 获取所有博客
   * @param errorHandler 自定义错误处理函数
   * @returns 博客列表
   */
  getAll: (errorHandler?: ErrorHandler) =>
    request.get<BlogPost[]>('/api/v1/blog/all', { errorHandler }),
};
