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
import { Menu, Plus } from 'lucide-react';

import { ChatSidebar, ChatAIPanels } from '../_components';
import { createModelConfig, INITIAL_PRIMARY_MODEL, DEFAULT_MODEL_CONFIG } from '../constants';
import { useConversations } from '../hooks/useConversations';
import { useChat } from '../hooks/useChat';
import { useChatModels } from '../hooks/useChatModels';
import type { ModelConfig, ChatSession } from '../types';

/** 最大允许的对比模型数量（不含主模型） */
const MAX_COMPARE_MODELS = 1;

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  // 通过ID格式判断是否是新会话（新会话ID为13位以上的时间戳）
  const isNewSession = /^\d{13,}$/.test(chatId);

  // 使用 Hook 管理会话列表
  const {
    sessions,
    deleteSession,
    renameSession,
    addSession,
    refresh,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useConversations();

  // 获取动态模型列表
  const { models, isLoading: isModelsLoading } = useChatModels();

  // 使用 Hook 管理聊天状态
  const { messages, status, conversationId, sendMessage, stopGenerating, loadConversation } =
    useChat();

  // 模型配置列表
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([INITIAL_PRIMARY_MODEL]);

  // 输入框内容
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // 主模型配置
  const primaryConfig = modelConfigs[0];

  // 是否可以添加对比模型
  const canAddCompareModel = modelConfigs.length <= MAX_COMPARE_MODELS;

  // 是否处于对比模式
  const isCompareMode = modelConfigs.length > 1;

  // 从 sessionStorage 读取保存的模型配置（解决新建会话时模型被重置的问题）
  // 使用 useEffect 避免 Hydration 错误
  useEffect(() => {
    const saved = sessionStorage.getItem('chat_model_config');

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ModelConfig;
        // 合并默认配置，防止因新增字段导致的属性缺失错误
        const mergedConfig = {
          ...DEFAULT_MODEL_CONFIG,
          ...parsed,
          id: 'primary-model',
        } as ModelConfig;
        setModelConfigs([mergedConfig]);
      } catch {
        // 解析失败，保持默认配置
      }
    }
  }, []);

  // 当模型列表加载完成后，自动选择第一个模型
  useEffect(() => {
    if (!isModelsLoading && models.length > 0) {
      const firstModel = models[0];
      setModelConfigs((prev) => {
        const current = prev[0];
        // 只有当当前模型不在列表中时才更新
        const isCurrentValid = models.some((m) => m.value === current.modelName);

        if (!isCurrentValid) {
          return [{ ...current, modelName: firstModel.value }, ...prev.slice(1)];
        }

        return prev;
      });
    }
  }, [isModelsLoading, models]);

  // 加载会话历史（非新会话）
  useEffect(() => {
    if (!isNewSession) {
      loadConversation(chatId);
    }
  }, [isNewSession, chatId, loadConversation]);

  // 检查是否有初始消息（从主页面跳转过来的）
  useEffect(() => {
    if (isNewSession && !isModelsLoading) {
      const initialMessage = sessionStorage.getItem(`chat_initial_message_${chatId}`);

      if (initialMessage) {
        sessionStorage.removeItem(`chat_initial_message_${chatId}`);
        // 设置到输入框并自动发送
        setInputValues((prev) => ({ ...prev, [primaryConfig.id]: initialMessage }));
        // 使用 setTimeout 确保状态更新后再发送
        setTimeout(() => {
          sendMessage(initialMessage, primaryConfig);
          setInputValues((prev) => ({ ...prev, [primaryConfig.id]: '' }));
        }, 100);
      }
    }
  }, [isNewSession, chatId, primaryConfig, sendMessage, isModelsLoading]);

  // 当获得 conversationId 后，将会话添加到历史列表
  useEffect(() => {
    // 只有当有确切的 conversationId，且当前列表里没有它时，尝试添加
    if (conversationId && messages.length > 0) {
      // 如果 URL 中的 ID (chatId) 与实际正式的 conversationId 不同，说明是新会话的首次跳转
      // 此时我们需要优先更新 URL，这样整个页面逻辑可以围绕正式 ID 运行
      if (chatId !== conversationId) {
        router.replace(`/chat-ai/${conversationId}`);

        return; // 跳转会导致重挂载，不再执行后续逻辑
      }

      const sessionExists = sessions.some((session) => session.id === conversationId);

      if (!sessionExists) {
        // 如果是新创建的或者是刚跳转过来的，确保它在列表中
        const newSession: ChatSession = {
          id: conversationId,
          title: messages[0]?.content.slice(0, 20) || '新会话',
          createdAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: messages.length,
        };
        addSession(newSession);
      }
    }
  }, [conversationId, messages, addSession, chatId, router, sessions]);

  /**
   * 更新主模型配置
   */
  const handleConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => [newConfig, ...prev.slice(1)]);
    // 保存到 sessionStorage，以便新建会话时恢复
    sessionStorage.setItem('chat_model_config', JSON.stringify(newConfig));
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
      sendMessage(value.trim(), config, {
        onSuccess: () => {
          // 消息生成完成后刷新会话列表
          refresh();
        },
      });
      setInputValues((prev) => ({ ...prev, [modelId]: '' }));
    },
    [inputValues, status, modelConfigs, primaryConfig, sendMessage, refresh],
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

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      const success = await deleteSession(sessionId);

      // 如果删除的是当前会话，跳转到新会话页面
      if (success && (chatId === sessionId || conversationId === sessionId)) {
        router.push('/chat-ai');
      }
    },
    [chatId, conversationId, deleteSession, router],
  );

  /**
   * 重命名会话
   */
  const handleRenameSession = useCallback(
    async (sessionId: string, newTitle: string) => {
      await renameSession(sessionId, newTitle);
    },
    [renameSession],
  );

  // 移动端侧边栏状态
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* 移动端顶栏 */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DocFlow AI
          </span>
        </div>
        <button
          onClick={handleNewSession}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="新建会话"
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ----- 左侧侧边栏 ----- */}
        <ChatSidebar
          config={primaryConfig}
          onConfigChange={handleConfigChange}
          onAddCompareModel={handleAddCompareModel}
          isCompareMode={isCompareMode}
          onCancelCompare={handleCancelCompare}
          sessions={sessions}
          activeSessionId={conversationId || chatId}
          onSessionClick={handleSessionClick}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
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
              onConfigChange={(newConfig) => {
                if (index === 0) handleConfigChange(newConfig);
                else handleCompareConfigChange(newConfig);
              }}
              isCompareMode={isCompareMode}
              onAddCompareModel={handleAddCompareModel}
              onCancelCompare={handleCancelCompare}
              showBorder={isCompareMode && index > 0}
              messages={messages}
              status={status}
              onStopGenerating={stopGenerating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
