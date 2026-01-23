export interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  icon: string;
  category: string;
  tags?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateListResponse {
  list: Template[];
  total: number;
}

export interface CreateTemplateParams {
  name: string;
  description: string;
  content: string;
  icon: string;
  category: string;
  tags?: string[];
}

export interface UpdateTemplateParams {
  name?: string;
  description?: string;
  content?: string;
  icon?: string;
  category?: string;
  tags?: string[];
}

export interface QueryTemplateParams {
  name?: string;
  category?: string;
  includeDeleted?: boolean;
}
