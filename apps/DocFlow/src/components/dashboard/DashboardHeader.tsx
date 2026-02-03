'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, HelpCircle, Menu, ChevronDown, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUserQuery, useLogoutMutation, getLocalUserData } from '@/hooks/useUserQuery';
import NotificationDropdown from '@/components/notifications/notification-dropdown';
import { useNotificationSocketContext } from '@/providers/NotificationSocketProvider';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

// Header用户区域骨架屏
function UserAreaSkeleton() {
  return (
    <div className="flex items-center space-x-2.5">
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
      <div className="hidden md:flex flex-col items-start space-y-1.5">
        <div className="h-3.5 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"></div>
        <div className="h-3 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-md animate-pulse"></div>
      </div>
      <ChevronDown className="h-4 w-4 text-gray-400/60 transition-transform duration-200" />
    </div>
  );
}

export default function DashboardHeader({
  onMenuToggle,
  showMenuButton = false,
  pageTitle,
  pageDescription,
}: DashboardHeaderProps) {
  // 使用 React Query 获取用户数据
  const queryClient = useQueryClient();
  const { data: user } = useUserQuery();
  const logoutMutation = useLogoutMutation();
  const [localUserData, setLocalUserData] = useState<any>(undefined);
  const [mounted, setMounted] = useState(false);

  // 获取在线用户数据
  const { onlineUsers, isConnected } = useNotificationSocketContext();

  // 加载本地用户数据作为fallback
  useEffect(() => {
    const cachedData = getLocalUserData(queryClient);

    if (cachedData) {
      setLocalUserData(cachedData);
    }
  }, [queryClient]);

  // 标记组件已挂载，避免 SSR hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 优先使用服务器数据，回退到本地数据
  const displayUser = user || localUserData;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // 使用传入的 pageTitle
  const displayTitle = pageTitle || '仪表盘';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 h-14">
        {/* 左侧：菜单按钮和页面标题 */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          {/* 移动端菜单按钮 */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden hover:bg-gray-50 transition-colors flex-shrink-0 rounded-lg cursor-pointer"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
          )}

          {/* 页面标题 */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {displayTitle}
            </h1>
            {pageDescription && (
              <p className="text-xs text-gray-600 hidden sm:block truncate">{pageDescription}</p>
            )}
          </div>
        </div>

        {/* 右侧：在线用户、通知、帮助、用户头像 */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* 在线用户数 - 只在客户端挂载后显示，避免 SSR hydration 错误 */}
          {mounted && (
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
              ></div>
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                {isConnected ? onlineUsers.length : 0}
              </span>
              <span className="text-xs text-blue-700">在线</span>
            </div>
          )}
          {/* 帮助按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 rounded-lg cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors duration-200" />
          </Button>

          {/* 通知下拉菜单 */}
          <NotificationDropdown />

          {/* 用户头像下拉菜单 */}
          {displayUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-11 w-auto px-2.5 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-200 rounded-xl group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <Avatar className="h-9 w-9 ring-2 ring-gray-200 ring-offset-2 transition-all duration-200 group-hover:ring-blue-400">
                      <AvatarImage
                        src={displayUser?.avatar_url || ''}
                        alt={displayUser?.name || '用户'}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                        {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-900 truncate max-w-24 group-hover:text-blue-600 transition-colors duration-200">
                        {displayUser?.name || '用户'}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-24">
                        {displayUser?.role || '用户'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block transition-transform duration-200 group-hover:translate-y-0.5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 max-w-[calc(100vw-2rem)] p-2 rounded-xl shadow-xl border border-gray-200/60 backdrop-blur-sm"
              >
                <DropdownMenuLabel className="pb-3 px-3">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                        <AvatarImage
                          src={displayUser?.avatar_url || ''}
                          alt={displayUser?.name || '用户'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {displayUser?.name || '用户'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {displayUser?.email || '暂无邮箱'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg inline-block w-fit border border-blue-100">
                      {displayUser?.role || '用户'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/user"
                    className="flex items-center py-2.5 px-3 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mr-3">
                      <User className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      个人资料
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center py-2.5 px-3 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-purple-100 transition-colors duration-200 mr-3">
                      <Settings className="h-4 w-4 text-gray-600 group-hover:text-purple-600 transition-colors duration-200" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      账户设置
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/docs"
                    className="flex items-center py-2.5 px-3 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-green-100 transition-colors duration-200 mr-3">
                      <HelpCircle className="h-4 w-4 text-gray-600 group-hover:text-green-600 transition-colors duration-200" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      帮助中心
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-gradient-to-r focus:from-red-50 focus:to-rose-50 cursor-pointer py-2.5 px-3 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 group"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors duration-200 mr-3">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium">
                    {logoutMutation.isPending ? '退出中...' : '退出登录'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <UserAreaSkeleton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
