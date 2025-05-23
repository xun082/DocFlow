import request, { ErrorHandler } from '../request';
import { CreateDocumentDto, DocumentResponse } from './type';

export const DocumentApi = {
  GetDocument: (errorHandler?: ErrorHandler) =>
    request.get<DocumentResponse>('/api/v1/documents', { errorHandler }),

  CreateDocument: (data: CreateDocumentDto, errorHandler?: ErrorHandler) =>
    request.post<DocumentResponse>('/api/v1/documents', {
      errorHandler,
      params: {
        ...data,
      },
    }),
};

export default DocumentApi;
