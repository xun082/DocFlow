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
interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface PodcastEvent {
  jobId: string;
  status: 'pending' | 'progress' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: any;
  error?: string;
  queueStats: QueueStats;
  timestamp: string;
}

export interface PodcastEventResponse {
  type: string;
  data: PodcastEvent;
  timestamp: string;
}
