import request, { ErrorHandler } from '../request';
import { User } from './type';

export interface ImageUploadResponse {
  fileUrl: string;
  fileHash: string;
  processedFileName: string;
  originalMimeType: string;
  processedMimeType: string;
  imageKitFileId: string;
}

export interface SearchUsersResponse {
  users: User[];
  total: number;
  timestamp: number;
}

export interface UpdateUserDto {
  name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  company: string | null;
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

  updateUser: (data: UpdateUserDto, errorHandler?: ErrorHandler) => {
    return request.put('/api/v1/users', {
      errorHandler,
      params: data,
    });
  },

  /**
   * 上传图片
   * @param file 图片文件
   * @param errorHandler 自定义错误处理函数
   * @returns 上传结果
   */
  uploadImage: async (file: File, errorHandler?: ErrorHandler) => {
    const formData = new FormData();
    formData.append('file', file);

    return request.post<ImageUploadResponse>('/api/v1/upload/image', {
      params: formData,
      errorHandler,
    });
  },
};

export default UserApi;
