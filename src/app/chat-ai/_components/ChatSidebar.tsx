'use client';

/**
 * 聊天侧边栏组件
 *
 * 功能说明：
 * - 整个侧边栏支持折叠/展开
 * - 包含配置面板（上方）和历史记录（下方）
 * - 配置面板默认不折叠
 */

import React, { useState, useEffect } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Settings2,
  LogOut,
  User as UserIcon,
  Settings,
} from 'lucide-react';

import ChatHistoryList from './ChatHistoryList';
import ModelConfigModal from './ModelConfigModal';
import type { ModelConfig, ChatSession } from '../types';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserQuery, useLogoutMutation } from '@/hooks/useUserQuery';
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
  const { data: user } = useUserQuery();
  const logoutMutation = useLogoutMutation();

  // 挂载状态
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

          {/* 用户信息底栏 - 仅在非折叠状态且已挂载后显示 */}
          {mounted && !isSidebarCollapsed && user && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-sm transition-all duration-200 text-left group">
                    <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm group-hover:ring-blue-50 transition-all">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user.name || '未命名用户'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider font-medium">
                        {user.role || 'GUEST'}
                      </p>
                    </div>
                    <Settings2 className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mb-2">
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => (window.location.href = '/dashboard/user')}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>个人中心</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => (window.location.href = '/dashboard/settings')}
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
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
