import request, { ErrorHandler } from '../request';
import {
  ContinueWritingParams,
  QuestionParams,
  CreateKnowledgeParams,
  AddKnowledgeFileParams,
  AddKnowledgeUrlParams,
  GetKnowledgeListParams,
  KnowledgeOptionListResponse,
  KnowledgeDetail,
  TextToImageParams,
  TextToImageResponse,
  GeneratePodcastParams,
  AgentQueryParams,
} from './type';

export const AiApi = {
  // 智能流式续写文本
  ContinueWriting: (
    data: ContinueWritingParams,
    callback: (response: Response) => void,
    errorHandler?: ErrorHandler,
  ) =>
    request.sse(
      '/api/v1/ai/continuations',
      {
        errorHandler,
        timeout: 80000,
        retries: 2,
        retryDelay: 2000,
        params: {
          ...data,
        },
      },
      callback,
    ),

  // AI 知识库问答（流式返回）
  Question: (
    data: QuestionParams,
    callback: (response: Response) => void,
    errorHandler?: ErrorHandler,
  ) =>
    request.sse(
      '/api/v1/ai/conversations',
      {
        errorHandler,
        timeout: 80000,
        retries: 2,
        retryDelay: 2000,
        params: {
          ...data,
        },
      },
      callback,
    ),

  // 创建知识库
  CreateKnowledge: (data: CreateKnowledgeParams, errorHandler?: ErrorHandler) =>
    request.post('/api/v1/ai/knowledge', {
      errorHandler,
      timeout: 60000,
      retries: 2,
      retryDelay: 2000,
      params: {
        ...data,
      },
    }),

  // 给知识库上传文件
  AddKnowledgeFile: (
    knowledgeId: number,
    file: File,
    data: AddKnowledgeFileParams,
    errorHandler?: ErrorHandler,
  ) => {
    const formData = new FormData();

    formData.append('file', file);

    if (data.apiKey) {
      formData.append('apiKey', data.apiKey);
    }

    return request.post(`/api/v1/ai/knowledge/${knowledgeId}/file`, {
      errorHandler,
      timeout: 120000,
      retries: 2,
      retryDelay: 2000,
      params: formData,
    });
  },

  // 给知识库添加网站链接
  AddKnowledgeUrl: (
    knowledgeId: number,
    data: AddKnowledgeUrlParams,
    errorHandler?: ErrorHandler,
  ) =>
    request.post(`/api/v1/ai/knowledge/${knowledgeId}/url`, {
      errorHandler,
      timeout: 60000,
      retries: 2,
      retryDelay: 2000,
      params: {
        ...data,
      },
    }),

  // 获取知识库选项列表
  GetKnowledgeOptions: (errorHandler?: ErrorHandler) =>
    request.get<KnowledgeOptionListResponse>('/api/v1/ai/knowledge/options', {
      errorHandler,
      timeout: 30000,
      retries: 2,
      retryDelay: 2000,
    }),

  // 获取知识库列表
  GetKnowledgeList: (data: GetKnowledgeListParams, errorHandler?: ErrorHandler) =>
    request.get('/api/v1/ai/knowledge', {
      errorHandler,
      timeout: 30000,
      retries: 2,
      retryDelay: 2000,
      params: {
        ...data,
      },
    }),

  // 获取知识库详情
  GetKnowledgeById: (knowledgeId: number, errorHandler?: ErrorHandler) =>
    request.get<KnowledgeDetail>(`/api/v1/ai/knowledge/${knowledgeId}`, {
      errorHandler,
      timeout: 30000,
      retries: 2,
      retryDelay: 2000,
    }),

  // 删除知识库
  DeleteKnowledge: (knowledgeId: number, errorHandler?: ErrorHandler) =>
    request.delete(`/api/v1/ai/knowledge/${knowledgeId}`, {
      errorHandler,
      timeout: 30000,
      retries: 2,
      retryDelay: 2000,
    }),

  // AI文生图
  TextToImage: (data: TextToImageParams, errorHandler?: ErrorHandler) =>
    request.post<TextToImageResponse>('/api/v1/ai/images', {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 2000,
      params: {
        ...data,
      },
    }),

  // AI播客生成（异步版本）
  GeneratePodcastAsync: (data: GeneratePodcastParams, errorHandler?: ErrorHandler) => {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('interviewer', data.interviewer);

    if (data.candidate_id) {
      formData.append('candidate_id', data.candidate_id);
    }

    if (data.interviewer_voice_id) {
      formData.append('interviewer_voice_id', data.interviewer_voice_id);
    }

    if (data.minimax_key) {
      formData.append('minimax_key', data.minimax_key);
    }

    if (data.apiKey) {
      formData.append('apiKey', data.apiKey);
    }

    return request.post<{ jobId: string; message: string }>('/api/v1/ai/podcasts/async', {
      errorHandler,
      timeout: 30000,
      retries: 2,
      retryDelay: 2000,
      params: formData,
    });
  },

  // AI智能助手对话（流式返回）
  StreamAgent: (
    data: AgentQueryParams,
    callback: (response: Response) => void,
    errorHandler?: ErrorHandler,
  ) =>
    request.sse(
      '/api/v1/ai/assistant-messages',
      {
        errorHandler,
        timeout: 80000,
        retries: 2,
        retryDelay: 2000,
        params: {
          ...data,
        },
      },
      callback,
    ),
};
