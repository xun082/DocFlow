'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Plus, User, UserIcon, Settings, LogOut } from 'lucide-react';

import { ChatSidebar, ChatAIPanels } from '.';
import { createModelConfig, INITIAL_PRIMARY_MODEL, DEFAULT_MODEL_CONFIG } from '../constants';
import { useConversations } from '../hooks/useConversations';
import { useChatModels } from '../hooks/useChatModels';
import type { ModelConfig, ChatMessage, ChatStatus, ChatSession } from '../types';

import { useUserQuery, useLogoutMutation } from '@/hooks/useUserQuery';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** 最大允许的对比模型数量（不含主模型） */
const MAX_COMPARE_MODELS = 1;

interface ChatInterfaceProps {
  /** 当前激活的会话 ID */
  activeSessionId?: string;
  /** 聊天消息列表 */
  messages?: ChatMessage[];
  /** 当前聊天状态 */
  status?: ChatStatus;
  /** 会话 ID（用于自动同步到会话列表） */
  conversationId?: string | null;
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
  conversationId,
  onSend,
  onNewSession,
  onSessionClick,
  onStopGenerating,
  onAfterDeleteSession,
  onInitInput,
}: ChatInterfaceProps) {
  const router = useRouter();
  // 使用 Hook 管理会话列表
  const {
    sessions,
    deleteSession,
    renameSession,
    hasMore,
    isLoadingMore,
    loadMore,
    addSession,
    refresh,
  } = useConversations();

  // 获取动态模型列表
  const { models, isLoading: isModelsLoading } = useChatModels();

  // 模型配置列表：第一个是主模型，后续是对比模型
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([INITIAL_PRIMARY_MODEL]);

  // 输入框内容：以模型 id 为 key
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // 移动端侧边栏状态
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 挂载状态，防止 hydration mismatch
  const [mounted, setMounted] = useState(false);

  // 获取用户信息
  const { data: user } = useUserQuery();

  // 退出登录
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 执行外部定义的初始化输入逻辑（只执行一次）
  const hasInitializedInputRef = React.useRef(false);

  useEffect(() => {
    if (onInitInput && !isModelsLoading && !hasInitializedInputRef.current) {
      hasInitializedInputRef.current = true;
      onInitInput(setInputValues, primaryConfig.id, (val) =>
        handleInternalSend(primaryConfig.id, val),
      );
    }
    // 只在模型加载完成时执行一次，不依赖 handleInternalSend
  }, [onInitInput, isModelsLoading]);

  // 自动同步会话到列表（当有新会话 ID 和消息时）
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const sessionExists = sessions.some((s) => s.id === conversationId);

      if (!sessionExists) {
        const newSession: ChatSession = {
          id: conversationId,
          title: '新对话',
          createdAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: messages.length,
        };
        addSession(newSession);
      }
    }
  }, [conversationId, messages, sessions, addSession]);

  // 当消息发送完成时刷新列表（更新标题等信息）
  useEffect(() => {
    // 从 streaming 变为 idle，说明生成完成
    if (status === 'idle' && conversationId && messages.length > 0) {
      // 延迟刷新，给后端时间生成标题
      const timer = setTimeout(() => {
        refresh();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [status, conversationId, messages.length, refresh]);

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
        <div className="flex items-center gap-3">
          <button
            onClick={onNewSession}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="新建会话"
          >
            <Plus className="h-5 w-5" />
          </button>
          {mounted && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-0 rounded-full transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm group-hover:ring-blue-50 transition-all">
                    <AvatarImage src={user.avatar_url || ''} alt={user.name || 'User'} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push('/dashboard/user')}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>个人中心</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>账户设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
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
