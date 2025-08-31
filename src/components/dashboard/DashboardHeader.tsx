'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  ChevronDown,
  Wifi,
  WifiOff,
} from 'lucide-react';

import { getPageDescription, PAGE_TITLE_MAP } from '@/utils/constants/navigation';
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
import { useNotificationSocket } from '@/hooks/ws/useNotificationSocket';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  pageTitle?: string;
}

// 模拟通知数据
const mockNotifications = [
  {
    id: 1,
    title: '新文档分享',
    message: 'John Doe 与您分享了"项目计划.docx"',
    time: '2分钟前',
    unread: true,
  },
  {
    id: 2,
    title: '会议提醒',
    message: '团队会议将在15分钟后开始',
    time: '13分钟前',
    unread: true,
  },
  {
    id: 3,
    title: '系统更新',
    message: 'DocFlow 已更新到版本 2.1.0',
    time: '1小时前',
    unread: false,
  },
];

// Header用户区域骨架屏
function UserAreaSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="hidden md:flex flex-col items-start space-y-1">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 w-12 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <ChevronDown className="h-4 w-4 text-gray-400" />
    </div>
  );
}

export default function DashboardHeader({
  onMenuToggle,
  showMenuButton = false,
  pageTitle,
}: DashboardHeaderProps) {
  // 使用 React Query 获取用户数据
  const { data: user } = useUserQuery();
  const logoutMutation = useLogoutMutation();
  const [notifications] = useState(mockNotifications);
  const [localUserData, setLocalUserData] = useState<any>(undefined);

  // WebSocket 连接
  const {
    isConnected,
    isConnecting,
    error,
    currentUser: wsUser,
    onlineUsers,
    connect,
    disconnect,
  } = useNotificationSocket();

  // 加载本地用户数据作为fallback
  useEffect(() => {
    const cachedData = getLocalUserData();

    if (cachedData) {
      setLocalUserData(cachedData);
    }
  }, []);

  // 优先使用服务器数据，回退到本地数据
  const displayUser = user || localUserData;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // 使用传入的 pageTitle
  const displayTitle = pageTitle || '仪表盘';

  // 查找与 pageTitle 对应的路径，用于获取页面描述
  let pathForDescription = '/dashboard';

  if (pageTitle) {
    const entry = Object.entries(PAGE_TITLE_MAP).find(([, title]) => title === pageTitle);

    if (entry) {
      pathForDescription = entry[0];
    }
  }

  const pageDescription = getPageDescription(pathForDescription);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 h-16">
        {/* 左侧：菜单按钮和页面标题 */}
        <div className="flex items-center space-x-4">
          {/* 移动端菜单按钮 */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
          )}

          {/* 页面标题 */}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-900">{displayTitle}</h1>
            {pageDescription && (
              <p className="text-sm text-gray-500 hidden sm:block">{pageDescription}</p>
            )}
          </div>
        </div>

        {/* 右侧：WebSocket状态、通知、帮助、用户头像 */}
        <div className="flex items-center space-x-3">
          {/* WebSocket 状态指示器 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100 flex items-center space-x-2"
              >
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : isConnecting ? (
                  <Wifi className="h-4 w-4 text-yellow-600 animate-pulse" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="hidden md:inline text-xs">
                  {isConnected ? '已连接' : isConnecting ? '连接中' : '未连接'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>WebSocket 连接状态</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">连接状态:</span>
                  <span
                    className={`text-sm font-medium ${
                      isConnected
                        ? 'text-green-600'
                        : isConnecting
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {isConnected ? '已连接' : isConnecting ? '连接中...' : '未连接'}
                  </span>
                </div>

                {wsUser && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">当前用户:</span>
                    <span className="text-sm font-medium">{wsUser.name}</span>
                  </div>
                )}

                {isConnected && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">在线用户:</span>
                    <span className="text-sm font-medium">{onlineUsers.length}人</span>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">错误: {error}</div>
                )}
              </div>

              <DropdownMenuSeparator />

              <div className="p-2 flex gap-2">
                {!isConnected && !isConnecting && (
                  <Button onClick={connect} size="sm" className="flex-1 text-xs">
                    重新连接
                  </Button>
                )}
                {isConnected && (
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    断开连接
                  </Button>
                )}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-gray-500 cursor-default">
                WebSocket 连接管理
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 帮助按钮 */}
          <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-gray-100">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>

          {/* 通知下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between py-3">
                <span className="font-semibold">通知中心</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
                    {unreadCount} 条未读
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start space-y-2 p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-medium text-sm ${
                          notification.unread ? 'text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {notification.title}
                      </span>
                      {notification.unread && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed w-full">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-blue-600 font-medium hover:bg-blue-50 focus:bg-blue-50 py-3">
                查看所有通知
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用户头像下拉菜单 */}
          {displayUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-2 hover:bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={displayUser?.avatar_url || ''}
                        alt={displayUser?.name || '用户'}
                      />
                      <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                        {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">
                        {displayUser?.name || '用户'}
                      </span>
                      <span className="text-xs text-gray-500">{displayUser?.role || '用户'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="pb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {displayUser?.name || '用户'}
                    </p>
                    <p className="text-xs text-gray-500">{displayUser?.email || '暂无邮箱'}</p>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block w-fit">
                      {displayUser?.role || '用户'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/user" className="flex items-center py-2 cursor-pointer">
                    <User className="mr-3 h-4 w-4 text-gray-500" />
                    <span>个人资料</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center py-2 cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4 text-gray-500" />
                    <span>账户设置</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/docs" className="flex items-center py-2 cursor-pointer">
                    <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                    <span>帮助中心</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>{logoutMutation.isPending ? '退出中...' : '退出登录'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="px-2">
              <UserAreaSkeleton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
