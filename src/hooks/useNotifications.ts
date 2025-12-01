import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { NotificationApi, type GetNotificationsQuery } from '@/services/notifications';

/**
 * 获取通知列表
 */
export function useNotificationsQuery(query?: GetNotificationsQuery) {
  return useQuery({
    queryKey: ['notifications', query],
    queryFn: async () => {
      const response = await NotificationApi.getNotifications(query);

      // RequestResult<T> -> data: ApiResponse<T> -> data: T
      return response.data?.data ?? null;
    },
    staleTime: 30000, // 30秒内数据保持新鲜
    refetchInterval: 60000, // 每60秒自动刷新
  });
}

/**
 * 获取未读通知数量
 */
export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await NotificationApi.getUnreadCount();

      // RequestResult<T> -> data: ApiResponse<T> -> data: T
      return response.data?.data ?? null;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * 标记通知为已读
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => NotificationApi.markAsRead(notificationId),
    onSuccess: () => {
      // 刷新通知列表和未读数量
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 标记所有通知为已读
 */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationApi.markAllAsRead(),
    onSuccess: () => {
      // 刷新通知列表和未读数量
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 删除通知
 */
export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => NotificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      // 刷新通知列表和未读数量
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
