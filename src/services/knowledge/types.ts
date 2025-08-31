// 创建知识库请求参数
export interface CreateKnowledge {
  apiKey: string;
  title: string;
  content: string;
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
  content: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// 获取知识库列表响应
export interface GetKnowledgeResponse {
  data: ApiKnowledgeItem[];
  total: number;
  page: number;
  limit: number;
}
