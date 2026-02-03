export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string | null;
  company?: string | null;
  role?: string;
}

export interface FriendRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string | null;
  created_at: string;
  updated_at: string;
  responded_at?: string | null;
  receiver?: User; // 接收者信息（发送的请求中）
  sender?: User; // 发送者信息（收到的请求中）
}

export interface FriendRequestsResponse {
  sent: FriendRequest[]; // 我发送的请求
  received: FriendRequest[]; // 我收到的请求
}
