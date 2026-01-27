'use client';

/**
 * 聊天会话详情页面
 *
 * 功能说明：
 * - 根据 URL 中的 room（会话ID）展示对应的聊天内容
 * - 左侧侧边栏：模型参数配置 + 聊天历史记录
 * - 右侧聊天区：显示该会话的聊天记录
 * - 支持 SSE 流式消息发送和接收
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ChatSidebar, ChatAIPanels } from '../_components';
import { createModelConfig, INITIAL_PRIMARY_MODEL } from '../constants';
import { useConversations, useChat } from '../hooks/useChatAI';
import type { ModelConfig, ChatSession } from '../types';

/** 最大允许的对比模型数量（不含主模型） */
const MAX_COMPARE_MODELS = 1;

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  // 判断是否是新会话（ID 是时间戳格式）
  const isNewSession = /^\d{13,}$/.test(chatId);

  // 使用 Hook 管理会话列表
  const { sessions, deleteSession, addSession } = useConversations();

  // 使用 Hook 管理聊天状态
  const { messages, status, conversationId, sendMessage, stopGenerating, loadConversation } =
    useChat();

  // 模型配置列表
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([INITIAL_PRIMARY_MODEL]);

  // 输入框内容
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // 是否已发送过消息（用于判断是否添加到历史）
  const [hasSentMessage, setHasSentMessage] = useState(false);

  // 主模型配置
  const primaryConfig = modelConfigs[0];

  // 是否可以添加对比模型
  const canAddCompareModel = modelConfigs.length <= MAX_COMPARE_MODELS;

  // 是否处于对比模式
  const isCompareMode = modelConfigs.length > 1;

  // 加载会话历史（非新会话）
  useEffect(() => {
    if (!isNewSession) {
      loadConversation(chatId);
    }
  }, [isNewSession, chatId, loadConversation]);

  // 检查是否有初始消息（从主页面跳转过来的）
  useEffect(() => {
    if (isNewSession) {
      const initialMessage = sessionStorage.getItem(`chat_initial_message_${chatId}`);

      if (initialMessage) {
        sessionStorage.removeItem(`chat_initial_message_${chatId}`);
        // 设置到输入框并自动发送
        setInputValues((prev) => ({ ...prev, [primaryConfig.id]: initialMessage }));
        // 使用 setTimeout 确保状态更新后再发送
        setTimeout(() => {
          sendMessage(initialMessage, primaryConfig);
          setHasSentMessage(true);
        }, 100);
      }
    }
  }, [isNewSession, chatId, primaryConfig, sendMessage]);

  // 当获得 conversationId 后，将会话添加到历史列表
  useEffect(() => {
    if (conversationId && hasSentMessage) {
      const newSession: ChatSession = {
        id: conversationId,
        title: messages[0]?.content.slice(0, 20) || '新会话',
        createdAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: messages.length,
      };
      addSession(newSession);

      // 如果 URL 中的 ID 与实际 conversationId 不同，更新 URL
      if (chatId !== conversationId) {
        router.replace(`/chat-ai/${conversationId}`);
      }
    }
  }, [conversationId, hasSentMessage, messages, addSession, chatId, router]);

  /**
   * 更新主模型配置
   */
  const handleConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => [newConfig, ...prev.slice(1)]);
  }, []);

  /**
   * 添加对比模型
   */
  const handleAddCompareModel = useCallback(() => {
    if (!canAddCompareModel) return;

    const newModelConfig = createModelConfig({
      modelName: primaryConfig.modelName,
      maxTokens: primaryConfig.maxTokens,
      temperature: primaryConfig.temperature,
      topP: primaryConfig.topP,
      enableThinking: primaryConfig.enableThinking,
      thinkingBudget: primaryConfig.thinkingBudget,
    });

    setModelConfigs((prev) => [...prev, newModelConfig]);
  }, [canAddCompareModel, primaryConfig]);

  /**
   * 更新对比模型配置
   */
  const handleCompareConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => (prev.length > 1 ? [prev[0], newConfig, ...prev.slice(2)] : prev));
  }, []);

  /**
   * 取消模型对比
   */
  const handleCancelCompare = useCallback(() => {
    setModelConfigs((prev) => prev.slice(0, 1));
  }, []);

  /**
   * 更新输入框内容
   */
  const handleInputChange = useCallback((modelId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [modelId]: value }));
  }, []);

  /**
   * 发送消息
   */
  const handleSend = useCallback(
    (modelId: string) => {
      const value = inputValues[modelId] || '';
      if (!value.trim() || status === 'streaming') return;

      const config = modelConfigs.find((c) => c.id === modelId) || primaryConfig;
      sendMessage(value.trim(), config);
      setInputValues((prev) => ({ ...prev, [modelId]: '' }));
      setHasSentMessage(true);
    },
    [inputValues, status, modelConfigs, primaryConfig, sendMessage],
  );

  /**
   * 快捷问题点击
   */
  const handleQuickQuestionClick = useCallback((modelId: string, question: string) => {
    setInputValues((prev) => ({ ...prev, [modelId]: question }));
  }, []);

  /**
   * 会话点击 - 跳转到对应的会话页面
   */
  const handleSessionClick = useCallback(
    (sessionId: string) => {
      router.push(`/chat-ai/${sessionId}`);
    },
    [router],
  );

  /**
   * 新建会话
   */
  const handleNewSession = useCallback(() => {
    router.push('/chat-ai');
  }, [router]);

  /**
   * 删除会话
   */
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      const success = await deleteSession(sessionId);

      // 如果删除的是当前会话，跳转到首页或第一个会话
      if (success && (chatId === sessionId || conversationId === sessionId)) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);

        if (remainingSessions.length > 0) {
          router.push(`/chat-ai/${remainingSessions[0].id}`);
        } else {
          router.push('/chat-ai');
        }
      }
    },
    [chatId, conversationId, sessions, deleteSession, router],
  );

  return (
    <div className="flex h-full">
      {/* ----- 左侧侧边栏 ----- */}
      <ChatSidebar
        config={primaryConfig}
        onConfigChange={handleConfigChange}
        onAddCompareModel={handleAddCompareModel}
        canAddCompareModel={canAddCompareModel}
        isCompareMode={isCompareMode}
        compareConfig={isCompareMode ? modelConfigs[1]! : null}
        onCompareConfigChange={handleCompareConfigChange}
        onCancelCompare={handleCancelCompare}
        sessions={sessions}
        activeSessionId={conversationId || chatId}
        onSessionClick={handleSessionClick}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* ----- 右侧聊天区域 ----- */}
      <div className={`flex flex-1 min-w-0 ${isCompareMode ? 'gap-0' : ''}`}>
        {modelConfigs.map((config, index) => (
          <ChatAIPanels
            key={config.id}
            config={config}
            inputValue={inputValues[config.id] || ''}
            onInputChange={(value) => handleInputChange(config.id, value)}
            onSend={() => handleSend(config.id)}
            onQuickQuestionClick={(q) => handleQuickQuestionClick(config.id, q)}
            showBorder={isCompareMode && index > 0}
            messages={messages}
            status={status}
            onStopGenerating={stopGenerating}
          />
        ))}
      </div>
    </div>
  );
}
