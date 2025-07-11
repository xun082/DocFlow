import request, { ErrorHandler } from '../request';
import {
  CreateDocumentDto,
  DocumentResponse,
  CreateShareLinkDto,
  ShareLinkResponse,
  DeleteDocumentDto,
  RenameDocumentDto,
  DuplicateDocumentDto,
  SharedDocumentsResponse,
  AccessSharedDocumentDto,
  AccessSharedDocumentResponse,
  GetDocumentContentResponse,
} from './type';

export const DocumentApi = {
  // 获取文档列表
  GetDocument: (errorHandler?: ErrorHandler) =>
    request.get<DocumentResponse>('/api/v1/documents', { errorHandler }),

  // 获取文档内容
  GetDocumentContent: (documentId: number, errorHandler?: ErrorHandler) =>
    request.get<GetDocumentContentResponse>(`/api/v1/documents/${documentId}/content`, {
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

  GetDocumentPermission: (id: string, errorHandler?: ErrorHandler) =>
    request.get<DocumentResponse>(`/api/v1/documents/${id}/user-permissions`, {
      errorHandler,
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
    request.get<SharedDocumentsResponse>('/api/v1/documents/shared-via-link', { errorHandler }),

  // 通过分享链接访问文档
  AccessSharedDocument: (data: AccessSharedDocumentDto, errorHandler?: ErrorHandler) =>
    request.get<AccessSharedDocumentResponse>(`/api/v1/documents/shared/${data.linkId}`, {
      errorHandler,
      params: {
        password: data.password,
      },
    }),
};

export default DocumentApi;
