'use client';

/**
 * 聊天会话详情页面
 */

import React, { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ChatInterface } from '../_components';
import { useChat } from '../hooks/useChat';
import { useConversations } from '../hooks/useConversations';
import type { ModelConfig, ChatSession } from '../types';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  // 判断是否是新会话
  const isNewSession = /^\d{13,}$/.test(chatId);

  const { refresh, addSession, sessions } = useConversations();
  const { messages, status, conversationId, sendMessage, stopGenerating, loadConversation } =
    useChat();

  /**
   * 加载会话历史
   */
  useEffect(() => {
    if (!isNewSession) {
      loadConversation(chatId);
    }
  }, [isNewSession, chatId, loadConversation]);

  /**
   * 处理新会话自动跳转与列表更新
   */
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // 1. 如果正式会话 ID 不同，必须等待生成结束后再更新 URL
      // 否则 URL 变更会导致组件重新加载，从而中断 SSE 流
      if (chatId !== conversationId) {
        if (status === 'idle') {
          router.replace(`/chat-ai/${conversationId}`);
        }
      }

      // 2. 确保新会话在左侧列表中（如果还不在）
      const sessionExists = sessions.some((s) => s.id === conversationId);

      if (!sessionExists) {
        const newSession: ChatSession = {
          id: conversationId,
          title: '新对话', // 初始显示为“新对话”，等待生成结束后更新标题
          createdAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: messages.length,
        };
        addSession(newSession);
      }
    }
  }, [conversationId, messages, chatId, router, sessions, addSession]);

  /**
   * 发送处理 (调用 SSE)
   */
  const handleSend = useCallback(
    (modelId: string, value: string, config: ModelConfig) => {
      sendMessage(value, config, {
        onSuccess: () => {
          // 延迟刷新列表，以便后端有足够时间生成标题
          refresh();
        },
      });
    },
    [sendMessage, refresh],
  );

  /**
   * 初始化输入逻辑 (处理从主页带过来的消息)
   */
  const handleInitInput = useCallback(
    (
      setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
      primaryConfigId: string,
      triggerSend: (value?: string) => void,
    ) => {
      if (isNewSession) {
        const initialMessage = sessionStorage.getItem(`chat_initial_message_${chatId}`);

        if (initialMessage) {
          sessionStorage.removeItem(`chat_initial_message_${chatId}`);
          // 回填输入框并直接触发发送
          setValues((prev) => ({ ...prev, [primaryConfigId]: initialMessage }));
          // 使用 ChatInterface 提供的 triggerSend 方法自动发送
          // 传入 initialMessage 以规避闭包状态未更新的问题
          setTimeout(() => {
            triggerSend(initialMessage);
          }, 0);
        }
      }
    },
    [isNewSession, chatId],
  );

  /**
   * 删除会话后的跳转
   */
  const handleAfterDeleteSession = useCallback(
    (deletedId: string) => {
      if (chatId === deletedId || conversationId === deletedId) {
        router.push('/chat-ai');
      }
    },
    [chatId, conversationId, router],
  );

  return (
    <ChatInterface
      activeSessionId={conversationId || chatId}
      messages={messages}
      status={status}
      onSend={handleSend}
      onNewSession={() => router.push('/chat-ai')}
      onStopGenerating={stopGenerating}
      onAfterDeleteSession={handleAfterDeleteSession}
      onInitInput={handleInitInput}
    />
  );
}
