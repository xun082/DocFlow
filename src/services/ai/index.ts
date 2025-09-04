import request, { ErrorHandler } from '../request';
import {
  CorrectTextParams,
  CorrectTextResponse,
  ContinueWritingParams,
  GenerateDiagramParams,
  QuestionParams,
} from './type';

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

  ContinueWriting: (
    data: ContinueWritingParams,
    callback: (response: Response) => void,
    errorHandler?: ErrorHandler,
  ) =>
    request.sse(
      '/api/v1/ai/continue-writing',
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

  // 问答
  Question: (
    data: QuestionParams,
    callback: (response: Response) => void,
    errorHandler?: ErrorHandler,
  ) =>
    request.sse(
      '/api/v1/ai/question',
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

  // 文本生成图片
  TextToImage: (data: GenerateDiagramParams, errorHandler?: ErrorHandler) =>
    request.post('/api/v1/ai/text-to-image', {
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
    request.post<CorrectTextResponse>('/api/v1/ai/text-to-image', {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 2000,
      params: {
        ...data,
      },
    }),
};
