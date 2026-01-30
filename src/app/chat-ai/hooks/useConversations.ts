'use client';

/**
 * 会话列表管理 Hook
 *
 * 功能说明：
 * - 管理会话列表的获取和缓存
 * - 管理会话的增删改操作
 */

import { useState, useCallback, useEffect } from 'react';

import type { ChatSession } from '../types';

import { ChatAiApi, type Conversation } from '@/services/chat-ai';

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
