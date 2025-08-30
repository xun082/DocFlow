import request, { ErrorHandler } from '../request';
import { CreateKnowledge } from './types';

export const KnowledgeApi = {
  // 创建知识库
  CreateKnowledge: (data: CreateKnowledge, errorHandler?: ErrorHandler) =>
    request.post<void>('/api/v1/ai/kb', {
      params: data,
      timeout: 60000, // 增加超时时间到60秒，因为AI处理可能需要更长时间
      errorHandler,
    }),
};
