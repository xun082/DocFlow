/**
 * Chat AI API 服务
 *
 * 提供 AI 聊天相关的 API 接口封装：
 * - 流式聊天补全（SSE）
 * - AI 续写（SSE）
 * - 会话列表管理
 * - 会话详情获取
 * - 会话删除和更新
 */

import request, { type ErrorHandler } from '../request';
import type {
  AutocompleteRequest,
  BrainstormRequest,
  CompletionsRequest,
  ConversationDetail,
  ConversationsResponse,
  ModelListResponse,
  OpenAIStreamResponse,
  PolishRequest,
  StreamChunk,
} from './type';

export const ChatAiApi = {
  /**
   * AI 续写（流式请求）
   *
   * @param data 请求参数
   * @param onMessage 消息回调
   * @param onError 错误回调
   * @returns 返回取消函数
   */
  Autocomplete: async (
    data: AutocompleteRequest,
    onMessage: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void,
  ): Promise<() => void> => {
    try {
      return await request.streamPost<OpenAIStreamResponse>(
        '/api/v1/chat/autocomplete',
        {
          timeout: 80000,
          params: data,
          errorHandler: onError
            ? { onError: (err) => onError(err instanceof Error ? err : new Error(String(err))) }
            : undefined,
        },
        (parsed) => {
          const content = parsed.choices?.[0]?.delta?.content || '';
          const reasoningContent = parsed.choices?.[0]?.delta?.reasoning_content || '';

          if (content || reasoningContent || parsed.choices?.[0]?.finish_reason) {
            onMessage({
              event: 'message',
              content,
              reasoning_content: reasoningContent,
              message_id: parsed.id,
              finish_reason: parsed.choices?.[0]?.finish_reason,
            });
          }
        },
        {
          onDone: () => onMessage({ event: 'done' }),
        },
      );
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }

      return () => {};
    }
  },

  /**
   * AI 润色（流式请求）
   *
   * @param data 请求参数
   * @param onMessage 消息回调
   * @param onError 错误回调
   * @returns 返回取消函数
   */
  Polish: async (
    data: PolishRequest,
    onMessage: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void,
  ): Promise<() => void> => {
    try {
      return await request.streamPost<OpenAIStreamResponse>(
        '/api/v1/chat/polish',
        {
          timeout: 80000,
          params: data,
          errorHandler: onError
            ? { onError: (err) => onError(err instanceof Error ? err : new Error(String(err))) }
            : undefined,
        },
        (parsed) => {
          const content = parsed.choices?.[0]?.delta?.content || '';
          const reasoningContent = parsed.choices?.[0]?.delta?.reasoning_content || '';

          if (content || reasoningContent || parsed.choices?.[0]?.finish_reason) {
            onMessage({
              event: 'message',
              content,
              reasoning_content: reasoningContent,
              message_id: parsed.id,
              finish_reason: parsed.choices?.[0]?.finish_reason,
            });
          }
        },
        {
          onDone: () => onMessage({ event: 'done' }),
        },
      );
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }

      return () => {};
    }
  },

  /**
   * AI 头脑风暴（流式请求，支持多个并发结果）
   *
   * @param data 请求参数
   * @param onMessage 消息回调（会收到多个index的消息）
   * @param onError 错误回调
   * @returns 返回取消函数
   */
  Brainstorm: async (
    data: BrainstormRequest,
    onMessage: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void,
  ): Promise<() => void> => {
    try {
      return await request.streamPost<OpenAIStreamResponse>(
        '/api/v1/chat/brainstorm',
        {
          timeout: 80000,
          params: data,
          errorHandler: onError
            ? { onError: (err) => onError(err instanceof Error ? err : new Error(String(err))) }
            : undefined,
        },
        (parsed) => {
          // 处理多个 choices（并发结果）
          parsed.choices?.forEach((choice) => {
            const content = choice.delta?.content || '';
            const reasoningContent = choice.delta?.reasoning_content || '';
            const index = choice.index ?? 0;

            if (content || reasoningContent || choice.finish_reason) {
              onMessage({
                event: 'message',
                index,
                content,
                reasoning_content: reasoningContent,
                message_id: parsed.id,
                finish_reason: choice.finish_reason,
              });
            }
          });
        },
        {
          onDone: () => onMessage({ event: 'done' }),
        },
      );
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }

      return () => {};
    }
  },

  /**
   * AI 聊天补全（流式请求）
   *
   * @param data 请求参数
   * @param onMessage 消息回调
   * @param onError 错误回调
   * @returns 返回取消函数
   */
  Completions: async (
    data: CompletionsRequest,
    onMessage: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void,
  ): Promise<() => void> => {
    try {
      return await request.streamPost<OpenAIStreamResponse>(
        '/api/v1/chat/completions',
        {
          timeout: 80000,
          params: data,
          errorHandler: onError
            ? { onError: (err) => onError(err instanceof Error ? err : new Error(String(err))) }
            : undefined,
        },
        (parsed) => {
          const content = parsed.choices?.[0]?.delta?.content || '';
          const reasoningContent = parsed.choices?.[0]?.delta?.reasoning_content || '';

          if (content || reasoningContent || parsed.choices?.[0]?.finish_reason) {
            onMessage({
              event: 'message',
              content,
              reasoning_content: reasoningContent,
              conversation_id: parsed.conversation_id,
              message_id: parsed.id,
              finish_reason: parsed.choices?.[0]?.finish_reason,
            });
          }
        },
        {
          onHeaders: (headers) => {
            // 提取响应头中的 Session-Id（新会话时返回）
            const sessionId = headers.get('Session-Id');

            if (sessionId) {
              onMessage({ event: 'message', conversation_id: sessionId });
            }
          },
          onDone: () => onMessage({ event: 'done' }),
        },
      );
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }

      return () => {};
    }
  },

  /**
   * 获取会话列表
   */
  Conversations: (data?: { page?: number; page_size?: number }, errorHandler?: ErrorHandler) =>
    request.get<ConversationsResponse>('/api/v1/chat/conversations', {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 1000,
      params: data,
    }),

  /**
   * 获取会话详情
   */
  ConversationDetail: (
    id: string,
    data?: { cursor?: string; limit?: number },
    errorHandler?: ErrorHandler,
  ) =>
    request.get<ConversationDetail>(`/api/v1/chat/conversations/${id}`, {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 1000,
      params: data,
    }),

  /**
   * 删除会话
   */
  DeleteConversation: (id: string, errorHandler?: ErrorHandler) =>
    request.delete(`/api/v1/chat/conversations/${id}`, {
      errorHandler,
      timeout: 80000,
      retries: 1,
      retryDelay: 1000,
    }),

  /**
   * 更新会话标题
   */
  UpdateConversationTitle: (id: string, title: string, errorHandler?: ErrorHandler) =>
    request.patch(`/api/v1/chat/conversations/${id}/title`, {
      errorHandler,
      timeout: 80000,
      retries: 1,
      retryDelay: 1000,
      params: { title },
    }),

  // 获取可用 AI 模型列表
  ChatModels: (errorHandler?: ErrorHandler) =>
    request.get<ModelListResponse>('/api/v1/chat/models', {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 1000,
    }),
};

// 导出类型
export type {
  AutocompleteRequest,
  BrainstormRequest,
  ChatMessage,
  ChatModel,
  CompletionsRequest,
  Conversation,
  ConversationDetail,
  ConversationsResponse,
  MessageRole,
  ModelListResponse,
  OpenAIStreamResponse,
  PolishRequest,
  StreamChunk,
} from './type';

export default ChatAiApi;
