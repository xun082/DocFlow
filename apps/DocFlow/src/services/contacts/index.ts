import request, { ErrorHandler } from '../request';

export interface SendFriendRequestDto {
  friendId: number;
  message?: string;
}

export const ContactApi = {
  /**
   * 发送好友请求
   * @param data 包含 friendId 和可选的 message
   * @param errorHandler 自定义错误处理函数
   */
  sendFriendRequest: (data: SendFriendRequestDto, errorHandler?: ErrorHandler) => {
    return request.post<void>('/api/v1/friend/request', {
      params: data,
      errorHandler,
    });
  },

  /**
   * 获取联系人列表
   */
  getContacts: (errorHandler?: ErrorHandler) => {
    return request.get('/api/v1/contacts', {
      errorHandler,
    });
  },

  /**
   * 获取好友请求列表
   */
  getFriendRequests: (errorHandler?: ErrorHandler) => {
    return request.get('/api/v1/friend/requests', {
      errorHandler,
    });
  },

  /**
   * 接受好友请求
   */
  acceptFriendRequest: (requestId: number, errorHandler?: ErrorHandler) => {
    return request.patch<void>(`/api/v1/friend/${requestId}/accept`, {
      errorHandler,
    });
  },

  /**
   * 拒绝好友请求
   */
  rejectFriendRequest: (requestId: number, errorHandler?: ErrorHandler) => {
    return request.patch<void>(`/api/v1/friend/${requestId}/reject`, {
      errorHandler,
    });
  },

  /**
   * 删除好友
   */
  removeFriend: (friendId: number, errorHandler?: ErrorHandler) => {
    return request.delete<void>(`/api/v1/friend/${friendId}`, {
      errorHandler,
    });
  },
};

export default ContactApi;
