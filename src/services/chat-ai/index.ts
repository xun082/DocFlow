/**
 * Chat AI API 服务
 *
 * 提供 AI 聊天相关的 API 接口封装：
 * - 流式聊天补全（SSE）
 * - 会话列表管理
 * - 会话详情获取
 * - 会话删除和更新
 */

import * as Sentry from '@sentry/nextjs';

import request, { type ErrorHandler } from '../request';

/** 聊天消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 聊天消息 */
export interface ChatMessage {
  /** 消息 ID */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
  /** 创建时间 */
  created_at: string;
}

/** 会话信息 */
export interface Conversation {
  /** 会话 ID */
  id: string;
  /** 会话标题 */
  title: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  last_message_at: string;
  /** 消息数量 */
  message_count: number;
}

/** 会话详情（包含消息列表） */
export interface ConversationDetail extends Conversation {
  /** 消息列表 */
  messages: ChatMessage[];
}

/** 聊天补全请求参数 */
export interface CompletionsRequest {
  /** 会话 ID (UUID)，如果不传则创建新会话 */
  conversation_id?: string;
  /** 模型名称 (预留字段，后端暂不支持) */
  model?: string;
  /** 消息列表 */
  messages: Array<{
    /** 消息角色：user, assistant, system */
    role: MessageRole;
    /** 消息内容 */
    content: string;
  }>;
  /** 生成的最大令牌数 (1-32768, 默认 1024) */
  max_tokens?: number;
  /** 采样温度 (0-2, 默认 1) */
  temperature?: number;
  /** Top-P 参数：核采样 (预留字段) */
  top_p?: number;
  /** 是否启用思维链 (预留字段) */
  enable_thinking?: boolean;
  /** 思维预算 (预留字段) */
  thinking_budget?: number;
  /** 是否启用联网搜索（启用后会先搜索相关网页内容，默认 false） */
  enable_web_search?: boolean;
}

/** SSE 流式响应事件数据 */
export interface StreamChunk {
  /** 事件类型 */
  event?: 'message' | 'done' | 'error';
  /** 内容片段 */
  content?: string;
  /** 会话 ID（首次响应时返回） */
  conversation_id?: string;
  /** 消息 ID */
  message_id?: string;
  /** 错误信息 */
  error?: string;
}

/** 会话列表响应 */
export interface ConversationsResponse {
  list: Conversation[];
  total: number;
}

/** 聊天模型信息 */
export interface ChatModel {
  /** 模型 ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型描述 */
  description: string;
  /** 是否支持深入思考 */
  support_thinking: boolean;
  /** 最大上下文长度 */
  max_context_length: number;
}

/** 模型列表响应 */
export interface ModelListResponse {
  list: ChatModel[];
}

export const ChatAiApi = {
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
      const cancel = await request.sse(
        '/api/v1/chat/completions',
        {
          timeout: 80000,
          params: data,
          errorHandler: onError
            ? { onError: (err) => onError(err instanceof Error ? err : new Error(String(err))) }
            : undefined,
        },
        async (response) => {
          if (!response.body) return;

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                onMessage({ event: 'done' });
                break;
              }

              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // 保留不完整的最后一行

              for (const line of lines) {
                if (line.trim() === '') continue;

                // 处理 data: 开头的行
                if (line.startsWith('data: ')) {
                  const jsonStr = line.slice(6);

                  if (jsonStr.trim() === '[DONE]') {
                    onMessage({ event: 'done' });
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(jsonStr);
                    const content = parsed.choices?.[0]?.delta?.content || '';

                    if (content || parsed.choices?.[0]?.finish_reason) {
                      onMessage({
                        event: 'message',
                        content,
                        conversation_id: parsed.conversation_id,
                        message_id: parsed.id,
                      });
                    }
                  } catch (e) {
                    // 忽略解析错误，可能是非 JSON 数据
                    Sentry.captureException(e, { extra: { jsonStr } });
                    console.error('解析错误', e);
                  }
                } else if (
                  !line.startsWith('event:') &&
                  !line.startsWith('id:') &&
                  !line.startsWith('retry:')
                ) {
                  // 尝试直接解析非 SSE 格式的 JSON（兼容性处理）
                  try {
                    const parsed = JSON.parse(line);
                    const content = parsed.choices?.[0]?.delta?.content || '';

                    if (content || parsed.choices?.[0]?.finish_reason) {
                      onMessage({
                        event: 'message',
                        content,
                        conversation_id: parsed.conversation_id,
                        message_id: parsed.id,
                      });
                    }
                  } catch (e) {
                    // 忽略
                    Sentry.captureException(e, { extra: { line } });
                    console.error('解析错误', e);
                  }
                }
              }
            }
          } catch (err) {
            if (onError) {
              onError(err instanceof Error ? err : new Error(String(err)));
            }
          }
        },
      );

      return cancel || (() => {});
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
  ConversationDetail: (id: string, errorHandler?: ErrorHandler) =>
    request.get<ConversationDetail>(`/api/v1/chat/conversations/${id}`, {
      errorHandler,
      timeout: 80000,
      retries: 2,
      retryDelay: 1000,
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

export default ChatAiApi;
