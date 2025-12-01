import request, { ErrorHandler } from '../request';

/**
 * 通知类型枚举
 */
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  INVITATION = 'INVITATION',
  JOIN_REQUEST = 'JOIN_REQUEST',
  MENTION = 'MENTION',
  COMMENT = 'COMMENT',
  SHARE = 'SHARE',
  PERMISSION = 'PERMISSION',
  ACTIVITY = 'ACTIVITY',
  DOCUMENT_EDIT = 'DOCUMENT_EDIT',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_ACCEPTED = 'FRIEND_ACCEPTED',
  FRIEND_REJECTED = 'FRIEND_REJECTED',
  REMINDER = 'REMINDER',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

/**
 * 通知优先级枚举
 */
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * 通知推送状态枚举
 */
export enum NotificationPushStatus {
  PENDING = 'PENDING',
  PUSHED = 'PUSHED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  SKIPPED = 'SKIPPED',
}

/**
 * 通知响应DTO
 */
export interface NotificationResponseDto {
  id: number;
  type: NotificationType;
  title: string;
  content?: string;
  userId: number;
  relatedUserId?: number;
  documentId?: number;
  organizationId?: number;
  spaceId?: number;
  commentId?: number;
  invitationId?: string;
  friendRequestId?: number;
  metadata?: any;
  actionUrl?: string;
  icon?: string;
  priority: NotificationPriority;
  expiresAt?: Date;
  isRead: boolean;
  readAt?: Date;
  pushStatus: NotificationPushStatus;
  pushedAt?: Date;
  pushAttempts: number;
  lastPushError?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 通知列表响应DTO
 */
export interface NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 未读通知数量响应DTO
 */
export interface UnreadCountResponseDto {
  count: number;
}

/**
 * 标记已读响应DTO
 */
export interface MarkAsReadResponseDto {
  success: boolean;
  unreadCount: number;
}

/**
 * 删除通知响应DTO
 */
export interface DeleteNotificationResponseDto {
  success: boolean;
  unreadCount: number;
}

/**
 * 重试失败通知响应DTO
 */
export interface RetryFailedResponseDto {
  success: boolean;
  retriedCount: number;
}

/**
 * 清理结果响应DTO
 */
export interface CleanupResultResponseDto {
  cleanedCount: number;
}

/**
 * 查询通知列表的参数
 */
export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
}

export const NotificationApi = {
  /**
   * 获取未读通知数量
   */
  getUnreadCount: (errorHandler?: ErrorHandler) => {
    return request.get<UnreadCountResponseDto>('/api/v1/notifications/unread', {
      errorHandler,
    });
  },

  /**
   * 获取通知列表
   * @param query 分页参数
   */
  getNotifications: (query?: GetNotificationsQuery, errorHandler?: ErrorHandler) => {
    return request.get<NotificationListResponseDto>('/api/v1/notifications', {
      params: query,
      errorHandler,
    });
  },

  /**
   * 标记指定通知为已读
   * @param notificationId 通知ID
   */
  markAsRead: (notificationId: number, errorHandler?: ErrorHandler) => {
    return request.patch<MarkAsReadResponseDto>(`/api/v1/notifications/${notificationId}/read`, {
      errorHandler,
    });
  },

  /**
   * 标记所有通知为已读
   */
  markAllAsRead: (errorHandler?: ErrorHandler) => {
    return request.patch<MarkAsReadResponseDto>('/api/v1/notifications/read-all', {
      errorHandler,
    });
  },

  /**
   * 删除指定通知
   * @param notificationId 通知ID
   */
  deleteNotification: (notificationId: number, errorHandler?: ErrorHandler) => {
    return request.delete<DeleteNotificationResponseDto>(
      `/api/v1/notifications/${notificationId}`,
      {
        errorHandler,
      },
    );
  },

  /**
   * 重试推送失败的通知
   */
  retryFailedNotifications: (errorHandler?: ErrorHandler) => {
    return request.post<RetryFailedResponseDto>('/api/v1/notifications/failed/retry', {
      errorHandler,
    });
  },

  /**
   * 清理过期通知（管理员功能）
   */
  cleanupExpiredNotifications: (errorHandler?: ErrorHandler) => {
    return request.delete<CleanupResultResponseDto>('/api/v1/notifications/expired', {
      errorHandler,
    });
  },
};

export default NotificationApi;
