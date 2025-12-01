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
  organization_id: string;
  email: string;
  role: OrganizationRole;
  message?: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
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
  email: string;
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
