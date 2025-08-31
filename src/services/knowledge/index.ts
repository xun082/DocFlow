import request, { ErrorHandler } from '../request';
import { CreateKnowledge, GetKnowledgeParams, GetKnowledgeResponse } from './types';

export const KnowledgeApi = {
  // 创建知识库
  CreateKnowledge: (data: CreateKnowledge, errorHandler?: ErrorHandler) =>
    request.post<void>('/api/v1/ai/kb', {
      params: data,
      timeout: 60000,
      errorHandler,
    }),

  getKnowledgeList: (params: GetKnowledgeParams, errorHandler?: ErrorHandler) =>
    request.get<GetKnowledgeResponse>('/api/v1/ai/kb', {
      errorHandler,
      params,
    }),
};
