'use client';

/**
 * 聊天会话详情页面
 */

import React, { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ChatInterface } from '../_components';
import { useChat } from '../hooks/useChat';
import type { ModelConfig } from '../types';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const isNewSession = /^\d{13,}$/.test(chatId);
  const hasInitializedRef = useRef(false);

  const { messages, status, conversationId, sendMessage, stopGenerating, loadConversation } =
    useChat();

  // 加载会话历史
  useEffect(() => {
    if (!isNewSession) {
      loadConversation(chatId);
    }
  }, [isNewSession, chatId, loadConversation]);

  // 处理新会话 URL 同步（不触发路由导航，避免组件重新挂载导致闪烁）
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      if (chatId !== conversationId && status === 'idle') {
        window.history.replaceState(null, '', `/chat-ai/${conversationId}`);
      }
    }
  }, [conversationId, messages.length, chatId, status]);

  // 发送处理
  const handleSend = (_modelId: string, value: string, config: ModelConfig) => {
    sendMessage(value, config);
  };

  // 初始化输入逻辑
  const handleInitInput = (
    _setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    _primaryConfigId: string,
    triggerSend: (value?: string) => void,
  ) => {
    if (hasInitializedRef.current) return;

    if (isNewSession) {
      const initialMessage = sessionStorage.getItem(`chat_initial_message_${chatId}`);

      if (initialMessage) {
        hasInitializedRef.current = true;
        sessionStorage.removeItem(`chat_initial_message_${chatId}`);
        triggerSend(initialMessage);
      }
    }
  };

  // 删除会话后的跳转
  const handleAfterDeleteSession = (deletedId: string) => {
    if (chatId === deletedId || conversationId === deletedId) {
      router.push('/chat-ai');
    }
  };

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
