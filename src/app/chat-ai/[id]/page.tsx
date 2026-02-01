'use client';

/**
 * 聊天会话详情页面
 */

import React, { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ChatInterface } from '../_components';
import { useChat } from '../hooks/useChat';
import type { ModelConfig } from '../types';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  // 判断是否是新会话
  const isNewSession = /^\d{13,}$/.test(chatId);

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
   * 处理新会话自动跳转
   */
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // 如果正式会话 ID 不同，必须等待生成结束后再更新 URL
      // 否则 URL 变更会导致组件重新加载，从而中断 SSE 流
      if (chatId !== conversationId && status === 'idle') {
        router.replace(`/chat-ai/${conversationId}`);
      }
    }
  }, [conversationId, messages, chatId, router, status]);

  /**
   * 发送处理 (调用 SSE)
   */
  const handleSend = useCallback(
    (modelId: string, value: string, config: ModelConfig) => {
      sendMessage(value, config);
    },
    [sendMessage],
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
      conversationId={conversationId}
      onSend={handleSend}
      onNewSession={() => router.push('/chat-ai')}
      onStopGenerating={stopGenerating}
      onAfterDeleteSession={handleAfterDeleteSession}
      onInitInput={handleInitInput}
    />
  );
}
