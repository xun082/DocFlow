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

import type { ChatSession, ChatMessage, ChatStatus, ModelConfig, ModelOption } from '../types';

import { ChatAiApi, type StreamChunk, type Conversation } from '@/services/chat-ai';

/**
 * 将后端会话数据转换为前端格式
 */
function convertConversation(conv: Conversation): ChatSession {
  return {
    id: conv.id,
    title: conv.title,
    createdAt: new Date(conv.created_at),
    lastMessageAt: new Date(conv.last_message_at),
    messageCount: conv.message_count,
  };
}

/**
 * 生成临时消息 ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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
  /** 重命名会话 */
  renameSession: (id: string, newTitle: string) => Promise<boolean>;
  /** 添加会话到列表（本地） */
  addSession: (session: ChatSession) => void;
}

// 会话列表缓存，避免多个组件重复调用接口
let cachedSessions: ChatSession[] | null = null;
let sessionsPromise: Promise<void> | null = null;
let sessionListeners: Array<(sessions: ChatSession[]) => void> = [];

// 通知所有监听器更新
function notifySessionListeners(sessions: ChatSession[]) {
  cachedSessions = sessions;
  sessionListeners.forEach((listener) => listener(sessions));
}

/**
 * 会话列表管理 Hook
 */
export function useConversations(): UseConversationsResult {
  // 初始状态使用空数组，避免 Hydration 错误
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 注册监听器
  useEffect(() => {
    const listener = (newSessions: ChatSession[]) => {
      setSessions(newSessions);
    };

    sessionListeners.push(listener);

    return () => {
      sessionListeners = sessionListeners.filter((l) => l !== listener);
    };
  }, []);

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
      notifySessionListeners(convertedSessions);
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

    const newSessions = (cachedSessions || []).filter((s) => s.id !== id);
    notifySessionListeners(newSessions);

    return true;
  }, []);

  // 添加会话到列表
  const addSession = useCallback((session: ChatSession) => {
    const current = cachedSessions || [];

    // 检查是否已存在
    if (current.some((s) => s.id === session.id)) {
      return;
    }

    notifySessionListeners([session, ...current]);
  }, []);

  // 重命名会话
  const renameSession = useCallback(async (id: string, newTitle: string): Promise<boolean> => {
    const { error: apiError } = await ChatAiApi.UpdateConversationTitle(id, newTitle);

    if (apiError) {
      console.error('重命名会话失败:', apiError);

      return false;
    }

    // 更新本地缓存
    const newSessions = (cachedSessions || []).map((s) =>
      s.id === id ? { ...s, title: newTitle } : s,
    );
    notifySessionListeners(newSessions);

    return true;
  }, []);

  // 初始化加载
  useEffect(() => {
    // 如果已有缓存，直接使用
    if (cachedSessions) {
      setSessions(cachedSessions);
      setIsLoading(false);

      return;
    }

    // 如果已有请求在进行中，等待完成
    if (sessionsPromise) {
      sessionsPromise.then(() => {
        if (cachedSessions) {
          setSessions(cachedSessions);
        }

        setIsLoading(false);
      });

      return;
    }

    // 发起新请求
    sessionsPromise = refresh();
  }, [refresh]);

  return {
    sessions,
    isLoading,
    error,
    refresh,
    deleteSession,
    renameSession,
    addSession,
  };
}

/**
 * 模型列表管理 Hook
 */
export interface UseChatModelsResult {
  /** 模型列表选项 */
  models: ModelOption[];
  /** 是否正在加载 */
  isLoading: boolean;
}

// 模块级缓存，避免多个组件重复调用接口
let cachedModels: ModelOption[] | null = null;
let modelsPromise: Promise<void> | null = null;

/**
 * 获取可用模型列表 Hook
 */
export function useChatModels(): UseChatModelsResult {
  // 初始状态使用空数组，避免 Hydration 错误
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 如果已有缓存，直接使用
    if (cachedModels) {
      setModels(cachedModels);
      setIsLoading(false);

      return;
    }

    // 如果已有请求在进行中，等待完成
    if (modelsPromise) {
      modelsPromise.then(() => {
        if (cachedModels) {
          setModels(cachedModels);
        }

        setIsLoading(false);
      });

      return;
    }

    // 发起新请求
    const fetchModels = async () => {
      setIsLoading(true);

      const { data } = await ChatAiApi.ChatModels();

      if (data?.data?.list && Array.isArray(data.data.list)) {
        const options: ModelOption[] = data.data.list.map((m) => ({
          value: m.id,
          label: m.name,
        }));
        cachedModels = options;
        setModels(options);
      }

      setIsLoading(false);
    };

    modelsPromise = fetchModels();
  }, []);

  return { models, isLoading };
}

/**
 * 聊天消息管理 Hook
 */

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
