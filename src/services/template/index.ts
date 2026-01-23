import { serverRequest, clientRequest } from '../request';
import type {
  Template,
  TemplateListResponse,
  CreateTemplateParams,
  UpdateTemplateParams,
  QueryTemplateParams,
} from './type';

export const templateServerApi = {
  /** 获取所有模板列表 */
  getAll: (params?: QueryTemplateParams) =>
    serverRequest.get<TemplateListResponse>('/api/v1/template', {
      params,
      cacheTime: 0,
    }),

  /** 获取模板详情 */
  getInfo: (id: number) =>
    serverRequest.get<Template>(`/api/v1/template/${id}`, {
      cacheTime: 0,
    }),
};

export const templateClientApi = {
  /** 创建模板（需要认证） */
  create: (data: CreateTemplateParams) =>
    clientRequest.post<Template>('/api/v1/template', { params: data }),

  /** 更新模板（需要认证） */
  update: (id: number, data: UpdateTemplateParams) =>
    clientRequest.put<Template>(`/api/v1/template/${id}`, { params: data }),

  /** 删除模板（需要认证） */
  delete: (id: number) => clientRequest.delete(`/api/v1/template/${id}`),

  /** 获取当前用户的模板列表（需要认证） */
  getMyTemplates: (params?: QueryTemplateParams) =>
    clientRequest.get<TemplateListResponse>('/api/v1/template/my-templates', {
      params,
      cacheTime: 0,
    }),
};
