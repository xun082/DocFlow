import { ReactNode } from 'react';
import {
  User,
  FileText,
  Settings,
  LayoutDashboard,
  BookOpen,
  Podcast,
  Bot,
  Workflow,
  Users,
  Building2,
} from 'lucide-react';

// Import route constants from routes.ts (Edge runtime compatible)
import { ROUTES } from './routes';

// 导航项接口
export interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
  tourContent?: string; // 可选的引导配置
}

// 导航项列表
export const NAV_ITEMS: NavItem[] = [
  {
    name: '仪表盘',
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard className="w-5 h-5" />,
    tourContent: '仪表盘用于展示系统概览和关键指标，帮助你快速了解当前工作状态。',
  },
  {
    name: '聊天助手',
    href: ROUTES.MESSAGES,
    icon: <Bot className="w-5 h-5" />,
    tourContent: '聊天助手提供 AI 对话能力，支持智能问答、写作辅助等功能。',
  },
  {
    name: '工作流',
    href: ROUTES.WORKFLOW,
    icon: <Workflow className="w-5 h-5" />,
    tourContent: '工作流模块用于配置和管理自动化流程，让重复性工作自动执行。',
  },
  {
    name: '文档',
    href: ROUTES.DOCS,
    icon: <FileText className="w-5 h-5" />,
    external: true,
    tourContent: '文档模块用于文档的编辑和管理，是协作文档的核心入口。',
  },
  {
    name: '知识库',
    href: ROUTES.KNOWLEDGE,
    icon: <BookOpen className="w-5 h-5" />,
    tourContent: '知识库用于沉淀和管理结构化知识，支持检索和复用知识内容。',
  },
  {
    name: '通讯录',
    href: ROUTES.CONTACTS,
    icon: <Users className="w-5 h-5" />,
    tourContent: '通讯录用于管理联系人、同事及外部联系人，方便快速协作与沟通。',
  },
  {
    name: '组织管理',
    href: ROUTES.ORGANIZATIONS,
    icon: <Building2 className="w-5 h-5" />,
    tourContent: '组织管理用于管理组织架构、成员与权限，是企业级协作的基础配置。',
  },
  {
    name: '我的资料',
    href: ROUTES.USER,
    icon: <User className="w-5 h-5" />,
    tourContent: '个人资料页面用于设置个人信息、账号与偏好。',
  },
  {
    name: '播客',
    href: ROUTES.PODCAST,
    icon: <Podcast className="w-5 h-5" />,
    tourContent: '播客模块提供播客相关能力，用于创建和管理播客内容。',
  },
  {
    name: '设置',
    href: ROUTES.SETTINGS,
    icon: <Settings className="w-5 h-5" />,
    tourContent: '设置模块用于配置系统级参数，例如语言、主题和高级选项。',
  },
];
