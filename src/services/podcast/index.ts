import request, { ErrorHandler } from '../request';
import { Podcast, ListParams, ListResponse, AsyncPodcast, GeneratePodcastParams } from './type';

// 播客服务相关常量
export const PODCAST_CONSTANTS = {
  INTERVIEWER_OPTIONS: [
    { value: 'front_end', label: '前端面试官' },
    { value: 'hrbp', label: 'HRBP面试官' },
    { value: 'marketing_manager', label: '经理面试官' },
  ],
  CANDIDATE_ID: 'hunyin_6',
  VOICE_ID: 'Chinese (Mandarin)_News_Anchor',
  SUPPORTED_FILE_TYPES: '.pdf,.md,.doc,.docx',
} as const;

export const PodcastApi = {
  getList: (params: ListParams = { page: 1, limit: 10 }, errorHandler?: ErrorHandler) =>
    request.get<ListResponse<Podcast>>('/api/v1/podcast', {
      params: {
        ...params,
      },
      errorHandler,
      timeout: 15000,
    }),

  // 上传文件生成AI播客（同步）
  generatePodcastFromFile: (params: GeneratePodcastParams, errorHandler?: ErrorHandler) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('interviewer', params.interviewer);
    formData.append('candidate_id', params.candidate_id);
    formData.append('interviewer_voice_id', params.interviewer_voice_id);
    formData.append('minimax_key', params.minimax_key);

    return request.post<Podcast>('/api/v1/ai/podcast', {
      errorHandler,
      timeout: 150000,
      params: formData,
    });
  },

  // 上传文件生成AI播客（异步）
  generatePodcastFromFileAsync: (params: GeneratePodcastParams, errorHandler?: ErrorHandler) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('interviewer', params.interviewer);
    formData.append('candidate_id', params.candidate_id);
    formData.append('interviewer_voice_id', params.interviewer_voice_id);
    formData.append('minimax_key', params.minimax_key);

    return request.post<AsyncPodcast>('/api/v1/ai/podcast/async', {
      errorHandler,
      timeout: 150000,
      params: formData,
    });
  },
};

export default PodcastApi;
