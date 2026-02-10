import request, { ErrorHandler } from '../request';
import type { LiveKitConnectionDetails, QuickCreateRoomDto, RoomInfo } from './type';

/**
 * 房间服务 API
 */
export const roomsApi = {
  /**
   * 快速创建房间并加入
   * 自动生成12位数字房间ID，并返回连接信息
   * @param options 创建房间选项
   * @param errorHandler 自定义错误处理函数
   * @returns LiveKit 连接信息
   */
  quickCreateRoom: (options?: QuickCreateRoomDto, errorHandler?: ErrorHandler) =>
    request.post<LiveKitConnectionDetails>('/api/v1/livekit/quick-create', {
      params: {
        maxParticipants: options?.maxParticipants,
        emptyTimeout: options?.emptyTimeout,
        metadata: options?.metadata,
      },
      errorHandler,
    }),

  /**
   * 加入现有房间
   * @param roomName 12位数字房间ID
   * @param errorHandler 自定义错误处理函数
   * @returns LiveKit 连接信息
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
    request.get<RoomInfo[]>('/api/v1/livekit/rooms', { errorHandler }),

  /**
   * 获取单个房间信息
   * @param roomName 房间名称
   * @param errorHandler 自定义错误处理函数
   * @returns 房间信息
   */
  getRoom: (roomName: string, errorHandler?: ErrorHandler) =>
    request.get<RoomInfo>(`/api/v1/livekit/rooms/${roomName}`, { errorHandler }),
};

export default roomsApi;
