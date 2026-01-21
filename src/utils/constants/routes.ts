/**
 * Route constants - Edge runtime compatible
 * This file contains only route strings without any React dependencies
 * Can be safely imported in middleware and other edge runtime code
 */

export const ROUTES = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  DOCS: '/docs',
  MESSAGES: '/dashboard/messages',
  WORKFLOW: '/dashboard/workflow',
  KNOWLEDGE: '/dashboard/knowledge',
  PODCAST: '/dashboard/podcast',
  USER: '/dashboard/user',
  SETTINGS: '/dashboard/settings',
  CONTACTS: '/dashboard/contacts',
  ORGANIZATIONS: '/dashboard/organizations',
  BLOG: '/dashboard/blogs',
} as const;

// 页面标题映射
export const PAGE_TITLE_MAP: Record<string, string> = {
  [ROUTES.DASHBOARD]: '仪表盘',
  [ROUTES.MESSAGES]: 'AI聊天助手',
  [ROUTES.WORKFLOW]: '工作流编辑器',
  [ROUTES.CONTACTS]: '通讯录',
  [ROUTES.ORGANIZATIONS]: '组织管理',
  [ROUTES.USER]: '个人资料',
  [ROUTES.SETTINGS]: '系统设置',
  [ROUTES.KNOWLEDGE]: '知识库管理',
  [ROUTES.PODCAST]: '播客管理',
  [ROUTES.DOCS]: '文档管理',
  [ROUTES.BLOG]: '博客管理',
};

// 页面描述映射
export const PAGE_DESCRIPTION_MAP: Record<string, string> = {
  [ROUTES.DASHBOARD]: '欢迎回来，查看您的工作概览',
  [ROUTES.USER]: '管理您的账户信息和资料',
  [ROUTES.MESSAGES]: '与AI助手进行智能对话和协作',
  [ROUTES.WORKFLOW]: '创建和管理自动化工作流程',
  [ROUTES.SETTINGS]: '配置您的偏好设置',
  [ROUTES.KNOWLEDGE]: '管理和组织您的知识库内容',
  [ROUTES.PODCAST]: '管理您的播客内容和任务',
  [ROUTES.CONTACTS]: '管理您的联系人信息',
  [ROUTES.ORGANIZATIONS]: '管理您的组织和团队协作',
};

// 获取页面标题的函数
export const getPageTitle = (path: string): string => {
  // 处理路径，移除查询参数和哈希值
  const cleanPath = path.split('?')[0].split('#')[0];

  // 尝试精确匹配
  if (PAGE_TITLE_MAP[cleanPath]) {
    return PAGE_TITLE_MAP[cleanPath];
  }

  // 如果没有精确匹配，尝试前缀匹配
  for (const [routePath, title] of Object.entries(PAGE_TITLE_MAP)) {
    if (cleanPath.startsWith(routePath + '/')) {
      return title;
    }
  }

  // 默认返回仪表盘
  return '仪表盘';
};

// 获取页面描述的函数
export const getPageDescription = (path: string): string => {
  return PAGE_DESCRIPTION_MAP[path] || '';
};
