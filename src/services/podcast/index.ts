import request, { ErrorHandler } from '../request';
import {
  Podcast,
  ListParams,
  ListResponse,
  AsyncPodcast,
  GeneratePodcastParams,
  DeletePodcastsParams,
  VoiceId,
} from './type';

// 播客服务相关常量
export const PODCAST_CONSTANTS = {
  // 面试官选项
  INTERVIEWER_OPTIONS: [
    { value: 'front_end', label: '前端面试官' },
    { value: 'hrbp', label: 'HRBP面试官' },
    { value: 'marketing_manager', label: '经理面试官' },
  ] as const,

  // 语音选项
  VOICE_OPTIONS: [
    { value: 'fnlp/MOSS-TTSD-v0.5:alex', label: 'Alex' },
    { value: 'fnlp/MOSS-TTSD-v0.5:anna', label: 'Anna' },
    { value: 'fnlp/MOSS-TTSD-v0.5:bella', label: 'Bella' },
    { value: 'fnlp/MOSS-TTSD-v0.5:benjamin', label: 'Benjamin' },
    { value: 'fnlp/MOSS-TTSD-v0.5:charles', label: 'Charles' },
    { value: 'fnlp/MOSS-TTSD-v0.5:claire', label: 'Claire' },
    { value: 'fnlp/MOSS-TTSD-v0.5:david', label: 'David' },
    { value: 'fnlp/MOSS-TTSD-v0.5:diana', label: 'Diana' },
  ] as const,

  // 默认配置
  DEFAULTS: {
    INTERVIEWER_VOICE: 'fnlp/MOSS-TTSD-v0.5:alex' as VoiceId,
    CANDIDATE_VOICE: 'fnlp/MOSS-TTSD-v0.5:anna' as VoiceId,
    SPEECH_SPEED: 1.0,
    SAMPLE_RATE: 32000,
    TEMPERATURE: 0.8,
  },

  // 支持的文件类型
  SUPPORTED_FILE_TYPES: '.pdf,.md,.doc,.docx',
} as const;

export const PodcastApi = {
  /**
   * 获取播客列表
   * @param params - 分页参数
   * @param errorHandler - 错误处理函数
   */
  getList: (params: ListParams = { page: 1, limit: 10 }, errorHandler?: ErrorHandler) =>
    request.get<ListResponse<Podcast>>('/api/v1/podcast', {
      params: {
        ...params,
      },
      errorHandler,
      timeout: 15000,
    }),

  /**
   * 批量删除播客
   * @param params - 包含要删除的播客 ID 数组
   * @param errorHandler - 错误处理函数
   */
  deleteBatch: (params: DeletePodcastsParams, errorHandler?: ErrorHandler) =>
    request.delete<{ message: string; deleted_count: number }>('/api/v1/podcast', {
      params,
      errorHandler,
      timeout: 15000,
    }),

  /**
   * 上传文件生成 AI 播客（同步）
   * @param params - 生成播客的参数
   * @param errorHandler - 错误处理函数
   */
  generatePodcastFromFile: (params: GeneratePodcastParams, errorHandler?: ErrorHandler) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('interviewer', params.interviewer);

    // 添加可选参数
    if (params.interviewer_voice) {
      formData.append('interviewer_voice', params.interviewer_voice);
    }

    if (params.candidate_voice) {
      formData.append('candidate_voice', params.candidate_voice);
    }

    if (params.speech_speed !== undefined) {
      formData.append('speech_speed', params.speech_speed.toString());
    }

    if (params.sample_rate !== undefined) {
      formData.append('sample_rate', params.sample_rate.toString());
    }

    if (params.temperature !== undefined) {
      formData.append('temperature', params.temperature.toString());
    }

    return request.post<Podcast>('/api/v1/podcast', {
      errorHandler,
      timeout: 150000,
      params: formData,
    });
  },

  /**
   * 上传文件生成 AI 播客（异步）
   * @param params - 生成播客的参数
   * @param errorHandler - 错误处理函数
   */
  generatePodcastFromFileAsync: (params: GeneratePodcastParams, errorHandler?: ErrorHandler) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('interviewer', params.interviewer);

    // 添加可选参数
    if (params.interviewer_voice) {
      formData.append('interviewer_voice', params.interviewer_voice);
    }

    if (params.candidate_voice) {
      formData.append('candidate_voice', params.candidate_voice);
    }

    if (params.speech_speed !== undefined) {
      formData.append('speech_speed', params.speech_speed.toString());
    }

    if (params.sample_rate !== undefined) {
      formData.append('sample_rate', params.sample_rate.toString());
    }

    if (params.temperature !== undefined) {
      formData.append('temperature', params.temperature.toString());
    }

    return request.post<AsyncPodcast>('/api/v1/ai/podcast/async', {
      errorHandler,
      timeout: 150000,
      params: formData,
    });
  },
};

export default PodcastApi;
