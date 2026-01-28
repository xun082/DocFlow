import {
  API_DOC_TEMPLATE,
  TECH_SOLUTION_TEMPLATE,
  BUG_REPORT_TEMPLATE,
  BUSINESS_PROPOSAL_TEMPLATE,
  PROJECT_PLAN_TEMPLATE,
  COURSE_OUTLINE_TEMPLATE,
  PRODUCT_REQUIREMENTS_TEMPLATE,
  DESIGN_SPEC_TEMPLATE,
} from './template-data';

/**
 * 模板接口定义
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string; // Markdown 内容
}

/**
 * 所有模板的元数据和内容
 */
export const TEMPLATES: Template[] = [
  // 技术类模板
  {
    id: 'tech-1',
    name: 'API 接口文档',
    description: '标准的 RESTful API 接口文档模板，包含请求方法、参数说明、返回示例等',
    category: 'TECH',
    tags: ['API', '接口', '技术文档'],
    content: API_DOC_TEMPLATE,
  },
  {
    id: 'tech-2',
    name: '技术方案文档',
    description: '技术方案设计文档，包含背景、目标、技术选型、架构设计等内容',
    category: 'TECH',
    tags: ['技术方案', '架构设计', '技术选型'],
    content: TECH_SOLUTION_TEMPLATE,
  },
  {
    id: 'tech-3',
    name: 'Bug 报告',
    description: 'Bug 报告模板，用于记录和追踪软件缺陷',
    category: 'TECH',
    tags: ['Bug', '缺陷', '问题追踪'],
    content: BUG_REPORT_TEMPLATE,
  },

  // 商务类模板
  {
    id: 'business-1',
    name: '商务合作提案',
    description: '商务合作提案模板，用于洽谈合作项目',
    category: 'BUSINESS',
    tags: ['商务', '合作', '提案'],
    content: BUSINESS_PROPOSAL_TEMPLATE,
  },

  // 项目类模板
  {
    id: 'project-1',
    name: '项目计划书',
    description: '项目计划书模板，包含项目目标、范围、进度计划等',
    category: 'PROJECT',
    tags: ['项目管理', '计划', '进度'],
    content: PROJECT_PLAN_TEMPLATE,
  },

  // 教育类模板
  {
    id: 'education-1',
    name: '课程大纲',
    description: '教育培训课程大纲模板',
    category: 'EDUCATION',
    tags: ['教育', '课程', '培训'],
    content: COURSE_OUTLINE_TEMPLATE,
  },

  // 产品类模板
  {
    id: 'product-1',
    name: '产品需求文档',
    description: '产品需求文档 (PRD) 模板',
    category: 'PRODUCT',
    tags: ['产品', 'PRD', '需求'],
    content: PRODUCT_REQUIREMENTS_TEMPLATE,
  },

  // 设计类模板
  {
    id: 'design-1',
    name: '设计规范文档',
    description: 'UI/UX 设计规范文档模板',
    category: 'DESIGN',
    tags: ['设计', 'UI', 'UX', '规范'],
    content: DESIGN_SPEC_TEMPLATE,
  },
];

/**
 * 根据 ID 获取模板
 */
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

/**
 * 根据分类获取模板列表
 */
export function getTemplatesByCategory(category?: string): Template[] {
  if (!category || category === 'all') {
    return TEMPLATES;
  }

  return TEMPLATES.filter((template) => template.category === category);
}

/**
 * 搜索模板
 */
export function searchTemplates(query: string): Template[] {
  if (!query || !query.trim()) {
    return TEMPLATES;
  }

  const searchQuery = query.toLowerCase();

  return TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery) ||
      template.description.toLowerCase().includes(searchQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery)),
  );
}

/**
 * 根据分类和搜索关键词过滤模板
 */
export function filterTemplates(category?: string, search?: string): Template[] {
  let results = TEMPLATES;

  // 按分类过滤
  if (category && category !== 'all') {
    results = results.filter((template) => template.category === category);
  }

  // 按搜索关键词过滤
  if (search && search.trim()) {
    const query = search.toLowerCase();
    results = results.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  return results;
}
