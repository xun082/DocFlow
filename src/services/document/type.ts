import { JSONContent } from '@tiptap/core';

export interface DocumentItem {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  sort_order: number;
  is_starred: boolean;
  is_deleted: boolean;
  created_at: string; // ISO 日期字符串，可根据需要改为 Date 类型
  updated_at: string;
  last_viewed: string | null;
  version: number;
  parent_id: number | null;
  owner_id: number;
}

// 文档所有者信息
export interface DocumentOwner {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string;
}

// 分享链接信息
export interface ShareLinkInfo {
  id: string;
  expires_at: string | null;
  has_password: boolean;
}

// 分享信息
export interface ShareInfo {
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  first_accessed_at: string;
  last_accessed_at: string;
  access_count: number;
  is_favorited: boolean;
  custom_title: string | null;
  share_link: ShareLinkInfo;
}

// 通过分享链接访问的文档项
export interface SharedDocumentItem extends DocumentItem {
  owner: DocumentOwner;
  shareInfo: ShareInfo;
}

// 返回结构类型
export interface DocumentResponse {
  owned: DocumentItem[];
  shared: DocumentItem[];
}

export interface LatestDocumentItem extends DocumentItem {
  author: string;
}

// 通过分享链接访问的文档响应
// export interface SharedDocumentsResponse {
//   data: SharedDocumentItem[];
//   code: number;
//   message: string;
//   timestamp: number;
// }

export interface CreateDocumentDto {
  title: string;
  type: 'FILE' | 'FOLDER';
  parent_id?: number;
  sort_order?: number;
  is_starred?: boolean;
  space_id?: number;
}

// 分享链接相关类型
export interface CreateShareLinkDto {
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  password?: string;
  expires_at?: string; // ISO 日期字符串
  shareWithUserIds?: number[]; // 分享给特定用户ID列表
}

export interface ShareLinkResponse {
  id: string; // 从返回数据看是字符串格式的ID
  document_id: number;
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  has_password: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  creator_id: number;
}

// 删除文档的请求类型
export interface DeleteDocumentDto {
  document_id: number;
  permanent?: boolean; // 是否永久删除
}

// 重命名文档的请求类型
export interface RenameDocumentDto {
  document_id: number;
  title: string;
}

// 复制文档的请求类型
export interface DuplicateDocumentDto {
  document_id: number;
  title?: string; // 新文档的标题，如果不提供则自动生成
  parent_id?: number; // 复制到的目标文件夹
}

// 通过分享链接访问文档的请求类型
export interface AccessSharedDocumentDto {
  linkId: string; // 分享链接ID
  password?: string; // 密码（如果需要）
}

// 通过分享链接访问文档的响应类型
export interface AccessSharedDocumentResponse {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  sort_order: number;
  is_starred: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  last_viewed: string | null;
  version: number;
  parent_id: number | null;
  owner_id: number;
  content: string | null;
  owner: {
    id: number;
    name: string;
    email: string | null;
    avatar_url: string;
  };
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  share_info: {
    id: string;
    expires_at: string | null;
    has_password: boolean;
    access_count: number;
    first_accessed_at: string | null;
    last_accessed_at: string | null;
  };
}

export interface DocumentPermissionData {
  documentId: number;
  userId: number;
  username: string;
  avatar: string;
  documentTitle: string;
  documentType: 'FILE' | 'FOLDER';
  isOwner: boolean;
  permission: 'NONE' | 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
}

export interface GetDocumentPermissionResponse {
  documentId: number;
  userId: number;
  documentTitle: string;
  documentType: 'FILE' | 'FOLDER';
  isOwner: boolean;
  permission: 'NONE' | 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
}

// 获取文档内容的响应类型
export interface DocumentPermissionsResponse {
  code: number;
  message: string;
  data: {
    id: number;
    title: string;
    content: JSONContent;
    owner: DocumentOwner;
    created_at: string;
    updated_at: string;
  };
  timestamp: number;
}

// 移动文档的请求类型
export interface MoveDocumentsDto {
  document_ids: number[];
  target_folder_id: number;
}
