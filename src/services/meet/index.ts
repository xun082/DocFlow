import request, { ErrorHandler } from '../request';
import type { LiveKitConnectionDetails, Room, QuickCreateRoomParams } from './type';

/**
 * 会议服务API
 */
export const meetApi = {
  /**
   * 快速创建房间并加入
   * 自动生成12位数字房间ID，并返回连接信息
   * @param params 房间配置参数
   * @param errorHandler 自定义错误处理函数
   * @returns 连接信息
   */
  quickCreateRoom: (params?: QuickCreateRoomParams, errorHandler?: ErrorHandler) =>
    request.post<LiveKitConnectionDetails>('/api/v1/livekit/quick-create', {
      params,
      errorHandler,
    }),

  /**
   * 加入现有房间
   * @param roomName 12位数字房间ID
   * @param errorHandler 自定义错误处理函数
   * @returns 连接信息
   */
  joinRoom: (roomName: string, errorHandler?: ErrorHandler) =>
    request.post<LiveKitConnectionDetails>('/api/v1/livekit/join', {
      params: { roomName },
      errorHandler,
    }),

  /**
   * 获取所有房间列表
   * @param errorHandler 自定义错误处理函数
   * @returns 房间列表
   */
  listRooms: (errorHandler?: ErrorHandler) =>
    request.get<Room[]>('/api/v1/livekit/rooms', { errorHandler }),

  /**
   * 获取房间信息
   * @param roomName 房间名
   * @param errorHandler 自定义错误处理函数
   * @returns 房间信息
   */
  getRoom: (roomName: string, errorHandler?: ErrorHandler) =>
    request.get<Room>(`/api/v1/livekit/rooms/${roomName}`, { errorHandler }),
};

export default meetApi;
