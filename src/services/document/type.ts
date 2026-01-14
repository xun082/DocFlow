import { JSONContent } from '@tiptap/core';

export interface DocumentItem {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  sort_order: number;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  parent_id: number | null;
  owner_id: number;
  organization_id: number | null;
  owner: DocumentOwner;
  organization?: DocumentOrganization | null;
  permission: 'VIEW' | 'COMMENT' | 'EDIT' | 'MANAGE' | 'FULL';
}

export interface DocumentOwner {
  id: number;
  name: string | null;
  avatar_url: string | null;
}

export interface DocumentOrganization {
  id: number;
  name: string;
}

export interface OrganizationDocumentGroup {
  id: number;
  name: string;
  documents: DocumentItem[];
}

export interface ShareLinkInfo {
  id: string;
  expires_at: string | null;
  has_password: boolean;
}

export interface ShareInfo {
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  first_accessed_at: string;
  last_accessed_at: string;
  access_count: number;
  is_favorited: boolean;
  custom_title: string | null;
  share_link: ShareLinkInfo;
}

export interface SharedDocumentItem {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  content?: any;
  owner: {
    id: number;
    username: string;
    name?: string;
    avatar: string | null;
    avatar_url?: string;
  };
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  customTitle: string | null;
  isFavorite: boolean;
  accessCount: number;
  firstAccessedAt: string;
  lastAccessedAt: string;
  created_at: string;
  updated_at: string;
  shareInfo?: {
    custom_title: string | null;
    permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
    is_favorited: boolean;
    access_count: number;
    first_accessed_at: string;
    last_accessed_at: string;
    share_link: {
      has_password: boolean;
      expires_at: string | null;
    };
  };
}

export interface GetDocumentsResponse {
  personal: DocumentItem[];
  organizations: OrganizationDocumentGroup[];
  shared: DocumentItem[];
  total: number;
}

export interface DocumentResponse {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  content?: JSONContent;
  created_at: string;
  updated_at: string;
}

export interface LatestDocumentItem {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  updated_at: string;
  last_viewed: string | null;
  author?: string;
}

export interface CreateDocumentDto {
  title: string;
  type: 'FILE' | 'FOLDER';
  parent_id?: number;
  sort_order?: number;
  is_starred?: boolean;
  organization_id?: number;
}

export interface CreateShareLinkDto {
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  password?: string;
  expires_at?: string;
  shareWithUserIds?: number[];
}

export interface ShareLinkResponse {
  id: string;
  document_id: number;
  permission: 'VIEW' | 'EDIT' | 'COMMENT' | 'MANAGE' | 'FULL';
  has_password: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  creator_id: number;
}

export interface DeleteDocumentDto {
  document_id: number;
  permanent?: boolean;
}

export interface RenameDocumentDto {
  document_id: number;
  title: string;
}

export interface DuplicateDocumentDto {
  document_id: number;
  title?: string;
  parent_id?: number;
}

export interface AccessSharedDocumentDto {
  linkId: string;
  password?: string;
}

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

export interface MoveDocumentsDto {
  document_ids: number[];
  target_folder_id: number;
}

export interface DocumentSearchItem {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  last_viewed: string | null;
  parent: { id: number; title: string } | null;
  childrenCount: number;
  isOwner: boolean;
}

export interface SearchResultResponse {
  documents: DocumentSearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContentSearchResultItem {
  id: number;
  title: string;
  type: 'FILE' | 'FOLDER';
  owner_id: number;
  owner_name: string;
  content_snippet: string;
  updated_at: string;
  last_viewed: string | null;
  permission: 'VIEW' | 'COMMENT' | 'EDIT' | 'MANAGE' | 'FULL' | null;
  custom_title: string | null;
}

export interface ContentSearchResultResponse {
  documents: ContentSearchResultItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SharedDocumentsResponse {
  documents: SharedDocumentItem[];
  total: number;
}
