'use client';

/**
 * 聊天消息管理 Hook
 *
 * 功能说明：
 * - 管理消息列表和发送
 * - 处理 SSE 流式接收
 * - 管理会话状态
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { ChatMessage, ChatStatus, ModelConfig } from '../types';

import { ChatAiApi, type StreamChunk } from '@/services/chat-ai';
import { useToast } from '@/hooks/use-toast';

/**
 * 生成临时消息 ID
 */
function generateMessageId(): string {
  return uuidv4();
}

export interface UseChatResult {
  /** 消息列表 */
  messages: ChatMessage[];
  /** 当前状态 */
  status: ChatStatus;
  /** 错误信息 */
  error: string | null;
  /** 会话 ID（发送首条消息后获得） */
  conversationId: string | null;
  /** 发送消息 */
  sendMessage: (
    content: string,
    config: ModelConfig,
    options?: { onSuccess?: () => void; onError?: (err: any) => void },
  ) => Promise<void>;
  /** 停止生成 */
  stopGenerating: () => void;
  /** 清空消息 */
  clearMessages: () => void;
  /** 加载会话历史 */
  loadConversation: (id: string, options?: { cursor?: string; limit?: number }) => Promise<boolean>;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  // 只有从后端成功获取或响应头返回的 ID 才是有效的 conversationId
  // 不要直接使用 URL 中的 ID，因为可能是前端生成的临时 ID
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  // 用于取消 SSE 连接
  const cancelFnRef = useRef<(() => void) | null>(null);

  // 加载会话历史
  const loadConversation = useCallback(
    async (id: string, options?: { cursor?: string; limit?: number }): Promise<boolean> => {
      setStatus('loading');
      setError(null);

      const { data, error: apiError } = await ChatAiApi.ConversationDetail(id, options);

      if (apiError) {
        setError(apiError);
        setStatus('error');
        toast({
          variant: 'destructive',
          title: '加载失败',
          description: apiError || '无法加载会话历史，请稍后重试',
        });

        return false;
      }

      if (data?.data?.messages) {
        const convertedMessages: ChatMessage[] = data.data.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          reasoningContent: msg.reasoning_content,
          createdAt: new Date(msg.created_at),
        }));
        setMessages(convertedMessages);
        setConversationId(id);
      }

      setStatus('idle');

      return true;
    },
    [],
  );

  // 发送消息
  // 发送消息
  const sendMessage = useCallback(
    async (
      content: string,
      config: ModelConfig,
      options?: { onSuccess?: () => void; onError?: (err: any) => void },
    ) => {
      if (!content.trim() || status === 'streaming') return;

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      };

      // 添加 AI 占位消息
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setStatus('streaming');
      setError(null);

      // 构建请求参数（只发送后端当前支持的字段）
      // 新会话时不发送 conversation_id，让后端自动创建
      const requestData = {
        ...(conversationId ? { conversation_id: conversationId } : {}),
        model: config.modelName,
        messages: [
          ...(config.systemPrompt
            ? [{ role: 'system' as const, content: config.systemPrompt.trim() }]
            : []),
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: content.trim() },
        ],
        top_p: config.topP,
        enable_thinking: config.enableThinking,
        thinking_budget: config.thinkingBudget,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        enable_web_search: config.enableWebSearch,
        top_k: config.topK,
        frequency_penalty: config.frequencyPenalty,
        min_p: config.minP,
        stop: config.stop,
        n: config.n,
      };

      try {
        let bufferedContent = '';
        let bufferedReasoningContent = '';
        let lastUpdateTime = 0;
        const THROTTLE_MS = 5; // 10ms force update interval for smoother perception

        const flushBuffer = () => {
          if (!bufferedContent && !bufferedReasoningContent) return;

          const contentToAppend = bufferedContent;
          const reasoningToAppend = bufferedReasoningContent;
          bufferedContent = '';
          bufferedReasoningContent = '';

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? {
                    ...m,
                    content: m.content + contentToAppend,
                    reasoningContent: (m.reasoningContent || '') + reasoningToAppend,
                    isStreaming: m.isStreaming, // 保留流式状态
                  }
                : m,
            ),
          );
          lastUpdateTime = Date.now();
        };

        const cancel = await ChatAiApi.Completions(
          requestData,
          (chunk: StreamChunk) => {
            if (chunk.event === 'done') {
              flushBuffer(); // Ensure remaining content is flushed
              setStatus('idle');
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMessage.id ? { ...m, isStreaming: false } : m)),
              );

              // 触发成功回调
              if (options?.onSuccess) {
                options.onSuccess();
              }

              return;
            }

            if (chunk.event === 'error') {
              flushBuffer();

              const errorMsg = chunk.error || '发生错误';
              setError(errorMsg);
              setStatus('error');
              toast({
                variant: 'destructive',
                title: 'AI 回复失败',
                description: errorMsg,
              });
              // 错误时停止 streaming 状态
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, isStreaming: false, content: m.content || '请求失败，请重试' }
                    : m,
                ),
              );

              if (options?.onError) {
                options.onError(new Error(errorMsg));
              }

              return;
            }

            // 更新会话 ID（首次响应时）
            if (chunk.conversation_id && !conversationId) {
              setConversationId(chunk.conversation_id);
            }

            // 追加内容到缓冲区
            if (chunk.content) {
              bufferedContent += chunk.content;
            }

            // 追加推理内容到缓冲区
            if (chunk.reasoning_content) {
              bufferedReasoningContent += chunk.reasoning_content;
            }

            // Throttle updates
            if (chunk.content || chunk.reasoning_content) {
              const now = Date.now();

              if (now - lastUpdateTime >= THROTTLE_MS) {
                flushBuffer();
              }
            }

            // 检查是否有明确的结束标识
            if (chunk.finish_reason) {
              flushBuffer(); // Ensure remaining content is flushed
              setStatus('idle');
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMessage.id ? { ...m, isStreaming: false } : m)),
              );

              // 触发成功回调
              if (options?.onSuccess) {
                options.onSuccess();
              }
            }
          },
          (err) => {
            console.error('SSE 错误:', err);
            flushBuffer();

            const errorMsg = String(err);
            setError(errorMsg);
            setStatus('error');
            toast({
              variant: 'destructive',
              title: '连接失败',
              description: errorMsg || '无法连接到 AI 服务，请检查网络或稍后重试',
            });
            // 错误时停止 streaming 状态
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, isStreaming: false, content: m.content || '请求失败，请重试' }
                  : m,
              ),
            );

            if (options?.onError) {
              options.onError(err instanceof Error ? err : new Error(String(err)));
            }
          },
        );

        cancelFnRef.current = cancel;
      } catch (err: any) {
        // 如果是取消请求导致的错误，直接忽略
        if (err.name === 'AbortError') return;

        const errorMsg = String(err);
        setError(errorMsg);
        setStatus('error');
        toast({
          variant: 'destructive',
          title: '请求失败',
          description: errorMsg || '发送消息失败，请稍后重试',
        });
        // 错误时停止 streaming 状态
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, isStreaming: false, content: m.content || '请求失败，请重试' }
              : m,
          ),
        );

        if (options?.onError) {
          options.onError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    },
    [conversationId, messages, status],
  );

  // 停止生成
  const stopGenerating = useCallback(() => {
    if (cancelFnRef.current) {
      cancelFnRef.current();
      cancelFnRef.current = null;
    }

    setStatus('idle');
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false, content: m.content || '已终止' } : m,
      ),
    );
  }, []);

  // 清空消息
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setStatus('idle');
  }, []);

  // 组件卸载时取消 SSE
  useEffect(() => {
    return () => {
      if (cancelFnRef.current) {
        try {
          cancelFnRef.current();
        } catch {
          // 忽略清理时的终止错误
        }
      }
    };
  }, []);

  return {
    messages,
    status,
    error,
    conversationId,
    sendMessage,
    stopGenerating,
    clearMessages,
    loadConversation,
  };
}
