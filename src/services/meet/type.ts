export interface LiveKitConnectionDetails {
  roomName: string;
  token: string;
  url: string;
  userName: string;
  userAvatar?: string;
}

export interface QuickCreateRoomParams {
  maxParticipants?: number;
  emptyTimeout?: number;
  metadata?: string;
}

export interface Room {
  name: string;
  sid?: string;
  emptyTimeout?: number;
  maxParticipants?: number;
  creationTime?: number;
  turnPassword?: string;
  enabledCodecs?: string[];
  metadata?: string;
  numParticipants?: number;
  numPublishers?: number;
  activeRecording?: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}
