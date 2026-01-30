import request, { ErrorHandler } from '../request';
import {
  Podcast,
  ListParams,
  ListResponse,
  AsyncPodcast,
  GeneratePodcastParams,
  DeletePodcastsParams,
  Voice,
  Interviewer,
} from './type';

// 播客服务相关常量
export const PODCAST_CONSTANTS = {
  // 面试官选项
  INTERVIEWER_OPTIONS: [
    { value: Interviewer.FrontEnd, label: '前端面试官' },
    { value: Interviewer.Hrbp, label: 'HRBP面试官' },
    { value: Interviewer.MarketingManager, label: '经理面试官' },
  ] as const,

  // 语音选项
  VOICE_OPTIONS: [
    { value: Voice.FnlpMOSSTTSDV05Alex, label: 'Alex (男声)' },
    { value: Voice.FnlpMOSSTTSDV05Anna, label: 'Anna (女声)' },
    { value: Voice.FnlpMOSSTTSDV05Bella, label: 'Bella (女声)' },
    { value: Voice.FnlpMOSSTTSDV05Benjamin, label: 'Benjamin (男声)' },
    { value: Voice.FnlpMOSSTTSDV05Charles, label: 'Charles (男声)' },
    { value: Voice.FnlpMOSSTTSDV05Claire, label: 'Claire (女声)' },
    { value: Voice.FnlpMOSSTTSDV05David, label: 'David (男声)' },
    { value: Voice.FnlpMOSSTTSDV05Diana, label: 'Diana (女声)' },
  ] as const,

  // 默认配置
  DEFAULTS: {
    INTERVIEWER: Interviewer.FrontEnd,
    INTERVIEWER_VOICE: Voice.FnlpMOSSTTSDV05Alex,
    CANDIDATE_VOICE: Voice.FnlpMOSSTTSDV05Anna,
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
   * 上传文件生成 AI 播客（异步）
   * @param params - 生成播客的参数
   * @param errorHandler - 错误处理函数
   */
  generatePodcastFromFileAsync: (params: GeneratePodcastParams, errorHandler?: ErrorHandler) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('interviewer', params.interviewer.toString());

    // 添加可选参数
    if (params.interviewer_voice) {
      formData.append('interviewer_voice', params.interviewer_voice.toString());
    }

    if (params.candidate_voice) {
      formData.append('candidate_voice', params.candidate_voice.toString());
    }

    if (params.temperature !== undefined) {
      formData.append('temperature', params.temperature.toString());
    }

    return request.post<AsyncPodcast>('/api/v1/podcast', {
      errorHandler,
      timeout: 150000,
      params: formData,
    });
  },
};

export default PodcastApi;
