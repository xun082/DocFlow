'use client';

/**
 * AI 聊天页面
 *
 * 功能说明：
 * - 左侧侧边栏：模型参数配置 + 聊天历史记录
 * - 右侧聊天区：支持单模型或多模型对比
 * - 添加对比模型后，聊天区域会分栏显示
 *
 * 状态管理：
 * - modelConfigs: 当前所有模型配置（主模型 + 对比模型）
 * - inputValues: 各模型的输入框内容
 * - 会话列表通过 useConversations Hook 管理
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { ChatSidebar, ChatAIPanels } from './_components';
import { createModelConfig, INITIAL_PRIMARY_MODEL, DEFAULT_MODEL_CONFIG } from './constants';
import { useConversations } from './hooks/useConversations';
import { useChatModels } from './hooks/useChatModels';
import type { ModelConfig } from './types';

/** 最大允许的对比模型数量（不含主模型） */
const MAX_COMPARE_MODELS = 1;

export default function ChatAIPage() {
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

    // 基于主模型配置创建新的对比模型
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
   * 更新对比模型配置（仅对比模式下存在）
   */
  const handleCompareConfigChange = useCallback((newConfig: ModelConfig) => {
    setModelConfigs((prev) => (prev.length > 1 ? [prev[0], newConfig, ...prev.slice(2)] : prev));
  }, []);

  /**
   * 取消模型对比，仅保留主模型
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
   * 发送消息（主页面只是跳转到新会话页面，实际发送在会话页面处理）
   */
  const handleSend = useCallback(
    (modelId: string) => {
      const value = inputValues[modelId] || '';
      if (!value.trim()) return;

      // 生成新会话 ID 并跳转
      const newSessionId = Date.now().toString();
      // 将输入内容保存到 sessionStorage，以便会话页面获取
      sessionStorage.setItem(`chat_initial_message_${newSessionId}`, value.trim());
      router.push(`/chat-ai/${newSessionId}`);
    },
    [inputValues, router],
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
   * 新建会话 - 已经在主页面时给予提示
   */
  const handleNewSession = useCallback(() => {
    toast.info('已是最新对话', {
      duration: 2000,
      position: 'top-center',
    });
  }, []);

  /**
   * 删除会话
   */
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId);
    },
    [deleteSession],
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
          activeSessionId=""
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
