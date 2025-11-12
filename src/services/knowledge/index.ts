import request, { ErrorHandler } from '../request';
import { CreateKnowledge, GetKnowledgeParams, GetKnowledgeResponse, KnowledgeBase } from './types';

export const KnowledgeApi = {
  // 创建知识库
  CreateKnowledge: (data: CreateKnowledge, errorHandler?: ErrorHandler) =>
    request.post<void>('/api/v1/ai/knowledge', {
      params: data,
      timeout: 60000,
      errorHandler,
    }),

  getKnowledgeList: (params: GetKnowledgeParams, errorHandler?: ErrorHandler) =>
    request.get<GetKnowledgeResponse>('/api/v1/ai/knowledge', {
      errorHandler,
      params,
    }),

  getKnowledgeById: (knowledgeId: number, errorHandler?: ErrorHandler) =>
    request.get<KnowledgeBase>(`/api/v1/ai/knowledge/${knowledgeId}`, {
      errorHandler,
    }),

  // 删除
  DeleteKnowledge: (knowledgeId: number, errorHandler?: ErrorHandler) =>
    request.delete<{ success: boolean }>(`/api/v1/ai/knowledge/${knowledgeId}`, {
      errorHandler,
    }),
};
