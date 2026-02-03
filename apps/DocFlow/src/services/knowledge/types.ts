// 创建知识库请求参数
export interface CreateKnowledge {
  apiKey?: string;
  title: string;
  description: string;
}

// 获取知识库列表请求参数
export interface GetKnowledgeParams {
  page?: number;
  limit?: number;
  search?: string;
}

// 知识库基础信息
export interface KnowledgeBase {
  id: number;
  title: string;
  description?: string;
  itemCount?: number;
  lastUpdated?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API返回的原始知识库数据
export interface ApiKnowledgeItem {
  id: number;
  title: string;
  description: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  files_count: number;
  urls_count: number;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 获取知识库列表响应
export interface GetKnowledgeResponse {
  data: ApiKnowledgeItem[];
  pagination: PaginationInfo;
}
