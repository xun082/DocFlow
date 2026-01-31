import request, { ErrorHandler } from '../request';
import {
  CreateTemplate,
  QueryTemplate,
  TemplateListData,
  TemplateResponse,
  UpdateTemplate,
} from './type';

export const TemplateApi = {
  // 获取模版列表
  GetTemplates: (params?: QueryTemplate, errorHandler?: ErrorHandler) =>
    request.get<TemplateListData>('/api/v1/template', {
      errorHandler,
      cacheTime: 0,
      params,
    }),

  // 创建模版
  CreateTemplate: (data: CreateTemplate, errorHandler?: ErrorHandler) =>
    request.post<TemplateResponse>('/api/v1/template', {
      errorHandler,
      params: data,
    }),

  // 删除模版
  DeleteTemplate: (templateId: number, errorHandler?: ErrorHandler) =>
    request.delete<{ success: boolean }>(`/api/v1/template/${templateId}`, {
      errorHandler,
    }),

  // 更新模版（重命名、修改描述等）
  UpdateTemplate: (templateId: number, data: UpdateTemplate, errorHandler?: ErrorHandler) =>
    request.patch<TemplateResponse>(`/api/v1/template/${templateId}`, {
      errorHandler,
      params: data,
    }),
};
