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
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import ChatHistoryList from './ChatHistoryList';
import ConfigPanel from './ConfigPanel';
import type { ModelConfig, ChatSession } from '../types';

import { cn } from '@/utils';

interface ChatSidebarProps {
  /** 当前模型配置 */
  config: ModelConfig;
  /** 配置变更回调 */
  onConfigChange: (config: ModelConfig) => void;
  /** 添加对比模型回调 */
  onAddCompareModel: () => void;
  /** 是否可以添加对比模型 */
  canAddCompareModel: boolean;
  /** 是否处于对比模式 */
  isCompareMode?: boolean;
  /** 对比模型配置（仅对比模式下有值） */
  compareConfig?: ModelConfig | null;
  /** 对比模型配置变更回调 */
  onCompareConfigChange?: (config: ModelConfig) => void;
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
}

export default function ChatSidebar({
  config,
  onConfigChange,
  onAddCompareModel,
  canAddCompareModel,
  isCompareMode = false,
  compareConfig = null,
  onCompareConfigChange,
  onCancelCompare,
  sessions,
  activeSessionId,
  onSessionClick,
  onNewSession,
  onDeleteSession,
}: ChatSidebarProps) {
  // 侧边栏折叠状态（默认展开）
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // 配置面板折叠状态（默认折叠）
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 切换配置面板折叠状态
  const toggleConfig = () => {
    setIsConfigExpanded(!isConfigExpanded);
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-100 flex flex-col transition-all duration-300',
        isSidebarCollapsed ? 'w-[48px] min-w-[48px]' : 'w-[280px] min-w-[280px]',
      )}
    >
      {/* 折叠侧边栏按钮 */}
      <div className="flex items-center justify-center p-2 border-b border-gray-100">
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title={isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-gray-600" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* 侧边栏内容（折叠时隐藏） */}
      {!isSidebarCollapsed && (
        <>
          {/* 配置面板（上方） */}
          <ConfigPanel
            config={config}
            onConfigChange={onConfigChange}
            onAddCompareModel={onAddCompareModel}
            canAddCompareModel={canAddCompareModel}
            isCompareMode={isCompareMode}
            compareConfig={compareConfig}
            onCompareConfigChange={onCompareConfigChange}
            onCancelCompare={onCancelCompare}
            isExpanded={isConfigExpanded}
            onToggleExpand={toggleConfig}
          />

          {/* 历史记录（下方） */}
          <div className="flex-1 min-h-0">
            <ChatHistoryList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSessionClick={onSessionClick}
              onNewSession={onNewSession}
              onDeleteSession={onDeleteSession}
            />
          </div>
        </>
      )}
    </aside>
  );
}
