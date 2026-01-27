'use client';

/**
 * AI 聊天状态管理 Hook
 *
 * 功能说明：
 * - 管理会话列表的获取和缓存
 * - 管理消息发送和 SSE 流式接收
 * - 管理会话的增删改操作
 */

import { useState, useCallback, useEffect, useRef } from 'react';

import type { ChatSession, ChatMessage, ChatStatus, ModelConfig } from '../types';

import { ChatAiApi, type StreamChunk, type Conversation } from '@/services/chat-ai';

// ==================== 工具函数 ====================

/**
 * 将后端会话数据转换为前端格式
 */
function convertConversation(conv: Conversation): ChatSession {
  return {
    id: conv.id,
    title: conv.title,
    createdAt: new Date(conv.created_at),
    lastMessageAt: new Date(conv.updated_at),
    messageCount: conv.message_count,
  };
}

/**
 * 生成临时消息 ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== Hook: 会话列表管理 ====================

export interface UseConversationsResult {
  /** 会话列表 */
  sessions: ChatSession[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 刷新会话列表 */
  refresh: () => Promise<void>;
  /** 删除会话 */
  deleteSession: (id: string) => Promise<boolean>;
  /** 添加会话到列表（本地） */
  addSession: (session: ChatSession) => void;
}

/**
 * 会话列表管理 Hook
 */
export function useConversations(): UseConversationsResult {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取会话列表
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: apiError } = await ChatAiApi.Conversations();

    if (apiError) {
      setError(apiError);
      setIsLoading(false);

      return;
    }

    if (data?.data?.list) {
      const convertedSessions = data.data.list.map(convertConversation);
      setSessions(convertedSessions);
    }

    setIsLoading(false);
  }, []);

  // 删除会话
  const deleteSession = useCallback(async (id: string): Promise<boolean> => {
    const { error: apiError } = await ChatAiApi.DeleteConversation(id);

    if (apiError) {
      console.error('删除会话失败:', apiError);

      return false;
    }

    setSessions((prev) => prev.filter((s) => s.id !== id));

    return true;
  }, []);

  // 添加会话到列表
  const addSession = useCallback((session: ChatSession) => {
    setSessions((prev) => {
      // 检查是否已存在
      if (prev.some((s) => s.id === session.id)) {
        return prev;
      }

      return [session, ...prev];
    });
  }, []);

  // 初始化加载
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    sessions,
    isLoading,
    error,
    refresh,
    deleteSession,
    addSession,
  };
}

// ==================== Hook: 聊天消息管理 ====================

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

/**
 * 聊天消息管理 Hook
 */
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
      // 注意：model, top_p, enable_thinking, thinking_budget 为预留字段，后端暂不支持
      // 新会话时不发送 conversation_id，让后端自动创建
      const requestData = {
        ...(conversationId ? { conversation_id: conversationId } : {}),
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: content.trim() },
        ],
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
