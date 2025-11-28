import { JSONContent } from '@tiptap/core';

import request, { ErrorHandler } from '../request';
import {
  CreateDocumentDto,
  DocumentResponse,
  CreateShareLinkDto,
  ShareLinkResponse,
  DeleteDocumentDto,
  RenameDocumentDto,
  DuplicateDocumentDto,
  // SharedDocumentsResponse,
  AccessSharedDocumentDto,
  AccessSharedDocumentResponse,
  SharedDocumentItem,
  DocumentPermissionData,
  LatestDocumentItem,
} from './type';

export const DocumentApi = {
  // 获取文档列表
  GetDocument: (errorHandler?: ErrorHandler) =>
    request.get<DocumentResponse>('/api/v1/documents', { errorHandler, cacheTime: 0 }),

  // 获取文档权限
  GetDocumentPermissions: (documentId: number, errorHandler?: ErrorHandler) =>
    request.get<DocumentPermissionData>(`/api/v1/documents/${documentId}/permissions`, {
      errorHandler,
    }),

  // 创建文档
  CreateDocument: (data: CreateDocumentDto, errorHandler?: ErrorHandler) =>
    request.post<DocumentResponse>('/api/v1/documents', {
      errorHandler,
      params: {
        ...data,
      },
    }),

  // 创建分享链接
  CreateShareLink: (documentId: number, data: CreateShareLinkDto, errorHandler?: ErrorHandler) =>
    request.post<ShareLinkResponse>(`/api/v1/documents/${documentId}/share`, {
      errorHandler,
      params: {
        permission: data.permission,
        password: data.password,
        expires_at: data.expires_at,
        shareWithUserIds: data.shareWithUserIds,
      },
    }),

  // 删除文档
  DeleteDocument: (data: DeleteDocumentDto, errorHandler?: ErrorHandler) =>
    request.delete<{ success: boolean }>(`/api/v1/documents/${data.document_id}`, {
      errorHandler,
      params: {
        permanent: data.permanent,
      },
    }),

  // 重命名文档
  RenameDocument: (data: RenameDocumentDto, errorHandler?: ErrorHandler) =>
    request.put<DocumentResponse>(`/api/v1/documents/${data.document_id}`, {
      errorHandler,
      params: {
        title: data.title,
      },
    }),

  // 保存文档内容
  SaveDocumentContent: (documentId: number, content: JSONContent, errorHandler?: ErrorHandler) =>
    request.put<{ success: boolean }>(`/api/v1/documents/${documentId}/content`, {
      errorHandler,
      params: {
        content,
      },
    }),

  // 复制文档
  DuplicateDocument: (data: DuplicateDocumentDto, errorHandler?: ErrorHandler) =>
    request.post<DocumentResponse>(`/api/v1/documents/${data.document_id}/duplicate`, {
      errorHandler,
      params: {
        title: data.title,
        parent_id: data.parent_id,
      },
    }),

  // 下载文档
  DownloadDocument: (documentId: number, errorHandler?: ErrorHandler) =>
    request.get<Blob>(`/api/v1/documents/${documentId}/download`, {
      errorHandler,
    }),

  // 获取通过分享链接访问过的文档
  GetSharedDocuments: (errorHandler?: ErrorHandler) =>
    request.get<SharedDocumentItem[]>('/api/v1/documents/shared-via-link', { errorHandler }),

  // 通过分享链接访问文档
  AccessSharedDocument: (data: AccessSharedDocumentDto, errorHandler?: ErrorHandler) =>
    request.get<AccessSharedDocumentResponse>(`/api/v1/documents/shared/${data.linkId}`, {
      errorHandler,
      params: {
        password: data.password,
      },
    }),

  // 移动文档
  MoveDocuments: (
    data: { document_ids: number[]; target_folder_id: number },
    errorHandler?: ErrorHandler,
  ) =>
    request.put<{ success: boolean }>('/api/v1/documents/move', {
      errorHandler,
      params: {
        document_ids: data.document_ids,
        target_folder_id: data.target_folder_id,
      },
    }),

  // 查询最新的文档
  GetLatestDocuments: (limit: number, errorHandler?: ErrorHandler) =>
    request.get<LatestDocumentItem[]>(`/api/v1/documents/latest/${limit}`, { errorHandler }),
};

export default DocumentApi;
