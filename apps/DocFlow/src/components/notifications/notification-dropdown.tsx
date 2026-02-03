'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
} from '@/hooks/useNotifications';

export default function NotificationDropdown() {
  const { data: notificationsData, isLoading: isLoadingNotifications } = useNotificationsQuery({
    page: 1,
    limit: 10,
  });
  const { data: unreadCountData, isLoading: isLoadingCount } = useUnreadCountQuery();
  const markAsReadMutation = useMarkAsReadMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData?.count || 0;

  // 格式化时间
  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhCN });
    } catch {
      return '刚刚';
    }
  };

  // 处理点击通知项
  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(notificationId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          {!isLoadingCount && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="font-semibold">通知中心</span>
          {!isLoadingCount && unreadCount > 0 && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
              {unreadCount} 条未读
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {isLoadingNotifications ? (
            // 加载骨架屏
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4"></div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            // 空状态
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">暂无通知</p>
            </div>
          ) : (
            // 通知列表
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start space-y-2 p-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                onClick={() => handleNotificationClick(notification.id, notification.isRead)}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-medium text-sm ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-900'
                    }`}
                  >
                    {notification.title}
                  </span>
                  {!notification.isRead && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                {notification.content && (
                  <p className="text-xs text-gray-600 leading-relaxed w-full">
                    {notification.content}
                  </p>
                )}
                <span className="text-xs text-gray-400">{formatTime(notification.createdAt)}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {!isLoadingNotifications && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-blue-600 font-medium hover:bg-blue-50 focus:bg-blue-50 py-3">
              查看所有通知
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
