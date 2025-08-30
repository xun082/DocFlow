import { z } from 'zod';

import { CreateKnowledge as ServiceCreateKnowledge } from '@/services/knowledge/types';

// 创建知识库的Zod schema - 基于服务类型
export const CreateKnowledgeSchema = z.object({
  apiKey: z.string().min(1, 'API Key不能为空'),
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '内容不能为空'),
}) satisfies z.ZodType<ServiceCreateKnowledge>;

export type CreateKnowledgeType = z.infer<typeof CreateKnowledgeSchema>;

// 知识库数据类型 - 用于前端显示
export const KnowledgeBaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  itemCount: z.number(),
  lastUpdated: z.string(),
  category: z.string(),
});

export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;
