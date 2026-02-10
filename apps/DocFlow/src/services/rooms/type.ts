/**
 * LiveKit 连接详情
 */
export interface LiveKitConnectionDetails {
  roomName: string;
  token: string;
  url: string;
  userName: string;
  userAvatar?: string;
}

/**
 * 快速创建房间参数
 */
export interface QuickCreateRoomDto {
  maxParticipants?: number;
  emptyTimeout?: number;
  metadata?: string;
}

/**
 * 加入房间参数
 */
export interface JoinRoomDto {
  roomName: string;
}

/**
 * 房间信息
 */
export interface RoomInfo {
  name: string;
  sid: string;
  emptyTimeout: number;
  maxParticipants: number;
  creationTime: number;
  metadata?: string;
  numParticipants: number;
  numPublishers: number;
  activeRecording: boolean;
}
