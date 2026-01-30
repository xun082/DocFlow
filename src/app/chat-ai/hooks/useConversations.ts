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
  /** 是否正在加载 (首次或刷新) */
  isLoading: boolean;
  /** 是否正在加载更多 */
  isLoadingMore: boolean;
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 错误信息 */
  error: string | null;
  /** 刷新会话列表 (重置到第一页) */
  refresh: () => Promise<void>;
  /** 加载下一页 */
  loadMore: () => Promise<void>;
  /** 删除会话 */
  deleteSession: (id: string) => Promise<boolean>;
  /** 重命名会话 */
  renameSession: (id: string, newTitle: string) => Promise<boolean>;
  /** 添加会话到列表（本地） */
  addSession: (session: ChatSession) => void;
}

// 会话列表状态接口
interface SessionState {
  sessions: ChatSession[];
  hasMore: boolean;
  page: number;
}

// 全局缓存状态，避免多个组件重复调用接口
let globalState: SessionState = {
  sessions: [],
  hasMore: true,
  page: 1,
};

let sessionsPromise: Promise<void> | null = null;
let isRefreshing = false;
let sessionListeners: Array<(state: SessionState) => void> = [];

// 通知所有监听器更新
function notifySessionListeners(newState: Partial<SessionState>) {
  globalState = { ...globalState, ...newState };
  sessionListeners.forEach((listener) => listener(globalState));
}

/**
 * 会话列表管理 Hook
 */
export function useConversations(): UseConversationsResult {
  // 获取全局状态
  const [sessionState, setSessionState] = useState<SessionState>(globalState);
  const [isLoading, setIsLoading] = useState(!globalState.sessions.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 注册监听器
  useEffect(() => {
    const listener = (newState: SessionState) => {
      setSessionState(newState);
    };

    sessionListeners.push(listener);

    return () => {
      sessionListeners = sessionListeners.filter((l) => l !== listener);
    };
  }, []);

  const pageSize = 20;

  // 刷新会话列表 (重置到第一页)
  const refresh = useCallback(async () => {
    if (isRefreshing) return (sessionsPromise || Promise.resolve()) as Promise<void>;

    isRefreshing = true;
    setIsLoading(true);
    setError(null);

    sessionsPromise = (async () => {
      try {
        const { data, error: apiError } = await ChatAiApi.Conversations({
          page: 1,
          page_size: pageSize,
        });

        if (apiError) {
          setError(apiError);

          return;
        }

        if (data?.data) {
          const { list, total } = data.data;
          const convertedSessions = list.map(convertConversation);
          const hasMore = convertedSessions.length < total;

          notifySessionListeners({
            sessions: convertedSessions,
            page: 1,
            hasMore,
          });
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
        isRefreshing = false;
        sessionsPromise = null;
      }
    })();

    return (sessionsPromise || Promise.resolve()) as Promise<void>;
  }, []);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !sessionState.hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    const nextPage = sessionState.page + 1;
    const { data, error: apiError } = await ChatAiApi.Conversations({
      page: nextPage,
      page_size: pageSize,
    });

    if (apiError) {
      setError(apiError);
      setIsLoadingMore(false);

      return;
    }

    if (data?.data) {
      const { list, total } = data.data;
      const newSessions = list.map(convertConversation);
      const updatedSessions = [...sessionState.sessions, ...newSessions];
      const hasMore = updatedSessions.length < total;

      notifySessionListeners({
        sessions: updatedSessions,
        page: nextPage,
        hasMore,
      });
    }

    setIsLoadingMore(false);
  }, [sessionState.page, sessionState.hasMore, sessionState.sessions, isLoadingMore]);

  // 删除会话
  const deleteSession = useCallback(async (id: string): Promise<boolean> => {
    const { error: apiError } = await ChatAiApi.DeleteConversation(id);

    if (apiError) {
      // 如果是 404 或类似错误，视为删除成功（幂等性）
      if (
        apiError.includes('不存在') ||
        apiError.includes('删除') ||
        apiError.includes('Not Found') ||
        apiError.includes('404')
      ) {
        // 继续执行本地删除
        console.warn('会话可能已被删除，执行本地清理');
      } else {
        console.error('删除会话失败:', apiError);

        return false;
      }
    }

    const newSessions = globalState.sessions.filter((s) => s.id !== id);
    notifySessionListeners({ sessions: newSessions });

    return true;
  }, []);

  // 添加会话到列表
  const addSession = useCallback((session: ChatSession) => {
    const current = globalState.sessions;

    // 检查是否已存在
    if (current.some((s) => s.id === session.id)) {
      return;
    }

    notifySessionListeners({ sessions: [session, ...current] });
  }, []);

  // 重命名会话
  const renameSession = useCallback(async (id: string, newTitle: string): Promise<boolean> => {
    const { error: apiError } = await ChatAiApi.UpdateConversationTitle(id, newTitle);

    if (apiError) {
      console.error('重命名会话失败:', apiError);

      return false;
    }

    // 更新本地缓存
    const newSessions = globalState.sessions.map((s) =>
      s.id === id ? { ...s, title: newTitle } : s,
    );
    notifySessionListeners({ sessions: newSessions });

    return true;
  }, []);

  // 初始化加载
  useEffect(() => {
    // 如果已有缓存数据，且未在请求中
    if (globalState.sessions.length > 0) {
      setSessionState(globalState);
      setIsLoading(false);

      return;
    }

    // 发起新请求
    refresh();
  }, [refresh]);

  return {
    sessions: sessionState.sessions,
    isLoading,
    isLoadingMore,
    hasMore: sessionState.hasMore,
    error,
    refresh,
    loadMore,
    deleteSession,
    renameSession,
    addSession,
  };
}
