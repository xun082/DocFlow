export interface ConnectionState {
  isConnected: boolean;
  error: string | null;
}

export interface OnlineUser {
  id: number;
  name: string;
}

export interface UserStatusEvent {
  type: 'USER_CONNECTED' | 'USER_DISCONNECTED';
  userId: number;
  userName: string;
  timestamp: string;
  totalOnline: number;
}

export interface ConnectedEvent {
  userId: number;
  userName: string;
  onlineCount: number;
}

export interface OnlineUsersResponse {
  users: OnlineUser[];
  count: number;
}
