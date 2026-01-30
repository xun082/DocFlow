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
  sendMessage: (content: string, config: ModelConfig) => Promise<void>;
  /** 停止生成 */
  stopGenerating: () => void;
  /** 清空消息 */
  clearMessages: () => void;
  /** 加载会话历史 */
  loadConversation: (id: string) => Promise<boolean>;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  // 只有从后端成功获取或响应头返回的 ID 才是有效的 conversationId
  // 不要直接使用 URL 中的 ID，因为可能是前端生成的临时 ID
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 用于取消 SSE 连接
  const cancelFnRef = useRef<(() => void) | null>(null);

  // 加载会话历史
  const loadConversation = useCallback(async (id: string): Promise<boolean> => {
    setStatus('loading');
    setError(null);

    const { data, error: apiError } = await ChatAiApi.ConversationDetail(id);

    if (apiError) {
      setError(apiError);
      setStatus('error');

      return false;
    }

    if (data?.data?.messages) {
      const convertedMessages: ChatMessage[] = data.data.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.created_at),
      }));
      setMessages(convertedMessages);
      setConversationId(id);
    }

    setStatus('idle');

    return true;
  }, []);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string, config: ModelConfig) => {
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
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: content.trim() },
        ],
        top_p: config.topP,
        enable_thinking: config.enableThinking,
        thinking_budget: config.thinkingBudget,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        enable_web_search: config.enableWebSearch,
      };

      try {
        const cancel = await ChatAiApi.Completions(
          requestData,
          (chunk: StreamChunk) => {
            if (chunk.event === 'done') {
              setStatus('idle');
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMessage.id ? { ...m, isStreaming: false } : m)),
              );

              return;
            }

            if (chunk.event === 'error') {
              setError(chunk.error || '发生错误');
              setStatus('error');
              // 错误时停止 streaming 状态
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, isStreaming: false, content: m.content || '请求失败，请重试' }
                    : m,
                ),
              );

              return;
            }

            // 更新会话 ID（首次响应时）
            if (chunk.conversation_id && !conversationId) {
              setConversationId(chunk.conversation_id);
            }

            // 追加内容
            if (chunk.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: m.content + chunk.content } : m,
                ),
              );
            }
          },
          (err) => {
            console.error('SSE 错误:', err);
            setError(String(err));
            setStatus('error');
            // 错误时停止 streaming 状态
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, isStreaming: false, content: m.content || '请求失败，请重试' }
                  : m,
              ),
            );
          },
        );

        cancelFnRef.current = cancel;
      } catch (err) {
        setError(String(err));
        setStatus('error');
        // 错误时停止 streaming 状态
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, isStreaming: false, content: m.content || '请求失败，请重试' }
              : m,
          ),
        );
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
        cancelFnRef.current();
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
