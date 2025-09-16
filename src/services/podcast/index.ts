import request, { ErrorHandler } from '../request';
import { Podcast, ListParams, ListResponse, AsyncPodcast } from './type';

export const PodcastApi = {
  getList: (params: ListParams = { page: 1, limit: 10 }, errorHandler?: ErrorHandler) =>
    request.get<ListResponse<Podcast>>('/api/v1/podcast', {
      params: {
        ...params,
      },
      errorHandler,
      timeout: 15000,
    }),

  // 增加一个文件上传转为AI博客的接口
  uploadFile: (formData: FormData, errorHandler?: ErrorHandler) =>
    request.post<Podcast>('/api/v1/ai/podcast', {
      errorHandler,
      timeout: 150000,
      params: formData,
    }),

  // 增加一个异步上传
  uploadFileAsync: (formData: FormData, errorHandler?: ErrorHandler) =>
    request.post<AsyncPodcast>('/api/v1/ai/podcast/mock', {
      errorHandler,
      timeout: 150000,
      params: formData,
    }),
};

export default PodcastApi;
