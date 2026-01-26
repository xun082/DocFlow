export interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  category: string;
  tags?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 模板列表响应
export interface TemplateListResponse {
  list: Template[];
  total: number;
}

// 创建模板参数
export interface CreateTemplateParams {
  name: string;
  description: string;
  content: string;
  category: string;
  tags?: string;
}

export interface UpdateTemplateParams {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface QueryTemplateParams {
  name?: string;
  category?: string;
  includeDeleted?: boolean;
}
