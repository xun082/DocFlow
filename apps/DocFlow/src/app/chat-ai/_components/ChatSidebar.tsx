'use client';

/**
 * 聊天侧边栏组件
 *
 * 功能说明：
 * - 整个侧边栏支持折叠/展开
 * - 包含配置面板（上方）和历史记录（下方）
 * - 配置面板默认不折叠
 */

import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

import ChatHistoryList from './ChatHistoryList';
import ModelConfigModal from './ModelConfigModal';
import type { ModelConfig, ChatSession } from '../types';

import { cn } from '@/utils';

interface ChatSidebarProps {
  /** 当前模型配置 */
  config: ModelConfig;
  /** 配置变更回调 */
  onConfigChange: (config: ModelConfig) => void;
  /** 添加对比模型回调 */
  onAddCompareModel: () => void;
  /** 是否处于对比模式 */
  isCompareMode?: boolean;
  /** 取消模型对比回调 */
  onCancelCompare?: () => void;
  /** 会话列表 */
  sessions: ChatSession[];
  /** 当前激活的会话 ID */
  activeSessionId?: string;
  /** 会话点击回调 */
  onSessionClick: (sessionId: string) => void;
  /** 新建会话回调 */
  onNewSession: () => void;
  /** 删除会话回调 */
  onDeleteSession: (sessionId: string) => void;
  /** 重命名会话回调 */
  onRenameSession?: (sessionId: string, newTitle: string) => void;
  /** 是否还有更多 */
  hasMore?: boolean;
  /** 是否正在加载更多 */
  isLoadingMore?: boolean;
  /** 加载更多回调 */
  onLoadMore?: () => void;
  /** 移动端是否开启（由父组件控制） */
  isMobileOpen?: boolean;
  /** 移动端关闭回调 */
  onMobileClose?: () => void;
}

export default function ChatSidebar({
  config,
  onConfigChange,
  onAddCompareModel,
  isCompareMode = false,
  onCancelCompare,
  sessions,
  activeSessionId,
  onSessionClick,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  isMobileOpen = false,
  onMobileClose,
}: ChatSidebarProps) {
  // 侧边栏折叠状态（默认展开）
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 切换配置面板折叠状态（已弃用，旧版逻辑可移除）
  // const toggleConfig = () => {
  //   setIsConfigExpanded(!isConfigExpanded);
  // };

  return (
    <>
      {/* 移动端遮罩层 */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden',
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onMobileClose}
      />

      <aside
        className={cn(
          'bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-[70]',
          // 移动端样式
          'fixed inset-y-0 left-0 lg:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // 桌面端折叠样式
          isSidebarCollapsed ? 'lg:w-[48px] lg:min-w-[48px]' : 'w-[280px] min-w-[280px]',
        )}
      >
        {/* 侧边栏头部控制栏 */}
        <div className="flex items-center justify-between p-2 border-b border-gray-100 min-h-[48px]">
          <div className="flex items-center gap-2 pl-2">
            <span
              className={cn(
                'text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-opacity',
                isSidebarCollapsed ? 'opacity-0 lg:hidden' : 'opacity-100',
              )}
            >
              DocFlow AI
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* 模型配置按钮 (模态框) */}
            {!isSidebarCollapsed && (
              <ModelConfigModal
                config={config}
                onConfigChange={onConfigChange}
                isCompareMode={isCompareMode}
                onAddCompareModel={onAddCompareModel}
                onCancelCompare={onCancelCompare}
                triggerClassName="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              />
            )}

            {/* 桌面端折叠按钮 */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-all"
              title={isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            {/* 移动端关闭按钮 */}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 侧边栏内容 */}
        <div
          className={cn(
            'flex-1 flex flex-col min-h-0 transition-opacity duration-200',
            isSidebarCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100',
          )}
        >
          {/* 历史记录（下方） */}
          <div className="flex-1 min-h-0">
            <ChatHistoryList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSessionClick={onSessionClick}
              onNewSession={onNewSession}
              onDeleteSession={onDeleteSession}
              onRenameSession={onRenameSession}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={onLoadMore}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
