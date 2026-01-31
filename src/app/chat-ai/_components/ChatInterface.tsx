'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Plus } from 'lucide-react';

import { ChatSidebar, ChatAIPanels } from '.';
import { createModelConfig, INITIAL_PRIMARY_MODEL, DEFAULT_MODEL_CONFIG } from '../constants';
import { useConversations } from '../hooks/useConversations';
import { useChatModels } from '../hooks/useChatModels';
import type { ModelConfig, ChatMessage, ChatStatus } from '../types';

/** 最大允许的对比模型数量（不含主模型） */
const MAX_COMPARE_MODELS = 1;

interface ChatInterfaceProps {
  /** 当前激活的会话 ID */
  activeSessionId?: string;
  /** 聊天消息列表 */
  messages?: ChatMessage[];
  /** 当前聊天状态 */
  status?: ChatStatus;
  /** 发送消息处理函数 */
  onSend: (modelId: string, value: string, config: ModelConfig) => void;
  /** 新建会话处理函数 */
  onNewSession: () => void;
  /** 会话点击处理函数 */
  onSessionClick?: (sessionId: string) => void;
  /** 停止生成处理函数 */
  onStopGenerating?: () => void;
  /** 删除会话后的回调（用于处理路由跳转等） */
  onAfterDeleteSession?: (deletedId: string) => void;
  /** 初始化输入框的处理（例如从 sessionStorage 读取） */
  onInitInput?: (
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    primaryConfigId: string,
    triggerSend: (value?: string) => void,
  ) => void;
}

export default function ChatInterface({
  activeSessionId = '',
  messages = [],
  status = 'idle',
  onSend,
  onNewSession,
  onSessionClick,
  onStopGenerating,
  onAfterDeleteSession,
  onInitInput,
}: ChatInterfaceProps) {
  const router = useRouter();
  // 使用 Hook 管理会话列表
  const { sessions, deleteSession, renameSession, hasMore, isLoadingMore, loadMore } =
    useConversations();

  // 获取动态模型列表
  const { models, isLoading: isModelsLoading } = useChatModels();

  // 模型配置列表：第一个是主模型，后续是对比模型
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([INITIAL_PRIMARY_MODEL]);

  // 输入框内容：以模型 id 为 key
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // 移动端侧边栏状态
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 主模型配置
  const primaryConfig = modelConfigs[0];

  // 是否可以添加对比模型
  const canAddCompareModel = modelConfigs.length <= MAX_COMPARE_MODELS;

  // 是否处于对比模式
  const isCompareMode = modelConfigs.length > 1;

  // 从 sessionStorage 读取保存的模型配置
  useEffect(() => {
    const saved = sessionStorage.getItem('chat_model_config');

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ModelConfig;
        const mergedConfig = {
          ...DEFAULT_MODEL_CONFIG,
          ...parsed,
          id: 'primary-model',
        } as ModelConfig;
        setModelConfigs([mergedConfig]);
      } catch {
        // 解析失败，保持默认
      }
    }
  }, []);

  /** 发送处理 */
  const handleInternalSend = useCallback(
    (modelId: string, overrideValue?: string) => {
      const value = overrideValue || inputValues[modelId] || '';
      if (!value.trim()) return;

      const config = modelConfigs.find((c) => c.id === modelId) || primaryConfig;
      onSend(modelId, value.trim(), config);
      setInputValues((prev) => ({ ...prev, [modelId]: '' }));
    },
    [inputValues, modelConfigs, primaryConfig, onSend],
  );

  // 执行外部定义的初始化输入逻辑
  useEffect(() => {
    if (onInitInput && !isModelsLoading) {
      onInitInput(setInputValues, primaryConfig.id, (val) =>
        handleInternalSend(primaryConfig.id, val),
      );
    }
  }, [onInitInput, isModelsLoading, primaryConfig.id, handleInternalSend]);

  // 模型列表加载后的自动选择策略
  useEffect(() => {
    if (!isModelsLoading && models.length > 0) {
      const firstModel = models[0];
      setModelConfigs((prev) => {
        const current = prev[0];
        const isCurrentValid = models.some((m) => m.value === current.modelName);

        if (!isCurrentValid) {
          return [{ ...current, modelName: firstModel.value }, ...prev.slice(1)];
        }

        return prev;
      });
    }
  }, [isModelsLoading, models]);

  /** 更新配置 */
  const handleConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => [newConfig, ...prev.slice(1)]);
    sessionStorage.setItem('chat_model_config', JSON.stringify(newConfig));
  }, []);

  /** 添加对比 */
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

  /** 更新对比配置 */
  const handleCompareConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => (prev.length > 1 ? [prev[0], newConfig, ...prev.slice(2)] : prev));
  }, []);

  /** 取消对比 */
  const handleCancelCompare = useCallback(() => {
    setModelConfigs((prev) => prev.slice(0, 1));
  }, []);

  /** 输入框变更 */
  const handleInputChange = useCallback((modelId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [modelId]: value }));
  }, []);

  /** 删除会话 */
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      const success = await deleteSession(sessionId);

      if (success) {
        onAfterDeleteSession?.(sessionId);
      }
    },
    [deleteSession, onAfterDeleteSession],
  );

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
          onClick={onNewSession}
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
          activeSessionId={activeSessionId}
          onSessionClick={onSessionClick || ((id) => router.push(`/chat-ai/${id}`))}
          onNewSession={onNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={renameSession}
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
              onSend={() => handleInternalSend(config.id)}
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
              onStopGenerating={onStopGenerating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
