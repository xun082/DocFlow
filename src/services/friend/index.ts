import request, { ErrorHandler } from '../request';
import type { FriendListData } from './types';

/**
 * 好友管理服务类
 */
export class FriendService {
  private baseUrl = '/api/v1/friend';

  /**
   * 获取好友列表
   */
  async getFriendList(errorHandler?: ErrorHandler) {
    const result = await request.get<FriendListData>(`${this.baseUrl}`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('获取好友列表时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data?.data;
  }

  /**
   * 删除好友
   * @param friendId 好友ID
   */
  async removeFriend(friendId: number, errorHandler?: ErrorHandler) {
    const result = await request.delete<void>(`${this.baseUrl}/${friendId}`, {
      errorHandler:
        errorHandler ||
        ((error) => {
          console.error('删除好友时出错:', error);
        }),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.data;
  }
}

// 创建单例实例
export const friendService = new FriendService();

// 导出默认实例
export default friendService;

// 导出所有类型
export * from './types';
