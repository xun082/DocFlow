import request, { ErrorHandler } from '../request';
import { CorrectTextParams, CorrectTextResponse } from './type';

export const AiApi = {
  CorrectText: (data: CorrectTextParams, errorHandler?: ErrorHandler) =>
    request.post<CorrectTextResponse>('/api/v1/ai/correct-text', {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 2000,
      params: {
        ...data,
      },
    }),
};

export const AiGenerateDiagram = {
  CorrectText: (data: CorrectTextParams, errorHandler?: ErrorHandler) =>
    request.post<CorrectTextResponse>('/api/v1/ai/generate-diagram', {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 2000,
      params: {
        ...data,
      },
    }),
};
