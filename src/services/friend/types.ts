/**
 * 好友关系状态
 */
export enum FriendshipStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
}

/**
 * 好友信息
 */
export interface Friend {
  id: number;
  name: string;
  email: string;
  avatar: string;
  last_active_at: string;
  friend_ship_id: number;
  friends_since: string;
  is_initiator: boolean;
  relationship_status: FriendshipStatus;
  is_online: boolean;
}

/**
 * 好友列表响应
 */
export interface FriendListData {
  friends: Friend[];
  total: number;
}
