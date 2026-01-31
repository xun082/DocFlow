'use client';

/**
 * AI 聊天页面 (主入口)
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ChatInterface } from './_components';

export default function ChatAIPage() {
  const router = useRouter();

  /**
   * 发送处理 (主页面重定向)
   */
  const handleSend = (modelId: string, value: string) => {
    // 生成临时会话 ID 并跳转
    const newSessionId = Date.now().toString();
    // 将初始消息保存，以便会话详情页获取并自动发送
    sessionStorage.setItem(`chat_initial_message_${newSessionId}`, value);
    router.push(`/chat-ai/${newSessionId}`);
  };

  /**
   * 新建会话 (主页提示)
   */
  const handleNewSession = () => {
    toast.info('已是最新对话', {
      duration: 2000,
      position: 'top-center',
    });
  };

  return <ChatInterface onSend={handleSend} onNewSession={handleNewSession} />;
}
