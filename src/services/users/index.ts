import request, { ErrorHandler } from '../request';
import { User } from './type';

export interface SearchUsersResponse {
  users: User[];
  total: number;
  timestamp: number;
}

export const UserApi = {
  /**
   * 搜索用户
   * @param query 搜索关键词（姓名或邮箱）
   * @param limit 返回结果数量限制
   * @param offset 偏移量
   * @param errorHandler 自定义错误处理函数
   * @returns 用户搜索结果
   */
  searchUsers: (
    query: string,
    limit: number = 10,
    offset: number = 0,
    errorHandler?: ErrorHandler,
  ) =>
    request.get<SearchUsersResponse>('/api/v1/users/search', {
      params: { q: query, limit, offset },
      errorHandler,
    }),
};

export default UserApi;
