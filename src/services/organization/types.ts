/**
 * 组织角色枚举
 */
export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * 组织角色信息
 */
export interface RoleInfo {
  value: OrganizationRole;
  label: string;
  description: string;
}

/**
 * 组织基本信息
 */
export interface Organization {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  website: string;
  is_verified: boolean;
  owner_id: number;
  user_role: OrganizationRole;
  created_at: string;
  updated_at: string;
}

/**
 * 组织列表数据
 */
export interface OrganizationListData {
  list: Organization[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * 组织成员
 */
export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  role: OrganizationRole;
  title: string;
  department: string;
  joined_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
  };
}

/**
 * 成员列表数据
 */
export interface MemberListData {
  members: OrganizationMember[];
}

/**
 * 组织空间
 */
export interface OrganizationSpace {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  role?: string;
  member_count?: number;
  document_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 加入请求
 */
export interface JoinRequest {
  id: string;
  organization_id: string;
  user_id: string;
  username: string;
  email: string;
  avatar_url?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  response_message?: string;
  created_at: string;
  processed_at?: string;
}

/**
 * 邀请信息
 */
export interface Invitation {
  id: string;
  type: string;
  status: string;
  email: string;
  role: string;
  message: string;
  code: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  inviter_id: number;
  invitee_id?: number | null;
  organization_id?: number | null;
  organization?: Organization;
  inviter?: {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
  };
  invitee?: {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
  };
}

/**
 * 邀请列表响应
 */
export interface InvitationListResponse {
  invitations: Invitation[];
  total: number;
}

/**
 * 创建组织请求（所有字段必传）
 */
export interface CreateOrganizationRequest {
  name: string;
  description: string;
  logo_url: string;
  website: string;
}

/**
 * 更新组织请求（所有字段可选）
 */
export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

/**
 * 邀请成员请求
 */
export interface InviteMemberRequest {
  user_id: number;
  role?: OrganizationRole;
  message?: string;
}

/**
 * 加入请求
 */
export interface JoinOrganizationRequest {
  message?: string;
}

/**
 * 处理加入请求
 */
export interface ProcessJoinRequestRequest {
  approve: boolean;
  response_message?: string;
}

/**
 * 更新成员角色请求
 */
export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}

/**
 * 查询组织列表参数
 */
export interface GetOrganizationsQuery {
  page?: number;
  limit?: number;
}

/**
 * 角色列表响应
 */
export interface GetRolesResponse {
  roles: RoleInfo[];
}

/**
 * 待处理项响应
 */
export interface PendingItemsResponse {
  invitations: Invitation[];
  requests: JoinRequest[];
  invitations_total: number;
  requests_total: number;
}

/**
 * 处理邀请/申请请求
 */
export interface ProcessItemRequest {
  id: string;
}
