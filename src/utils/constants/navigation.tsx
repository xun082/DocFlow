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
}

// 导航项列表
export const NAV_ITEMS: NavItem[] = [
  {
    name: '仪表盘',
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: '聊天助手',
    href: ROUTES.MESSAGES,
    icon: <Bot className="w-5 h-5" />,
  },
  {
    name: '工作流',
    href: ROUTES.WORKFLOW,
    icon: <Workflow className="w-5 h-5" />,
  },
  {
    name: '文档',
    href: ROUTES.DOCS,
    icon: <FileText className="w-5 h-5" />,
    external: true,
  },
  {
    name: '知识库',
    href: ROUTES.KNOWLEDGE,
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: '通讯录',
    href: ROUTES.CONTACTS,
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: '组织管理',
    href: ROUTES.ORGANIZATIONS,
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    name: '个人资料',
    href: ROUTES.USER,
    icon: <User className="w-5 h-5" />,
  },
  {
    name: '播客',
    href: ROUTES.PODCAST,
    icon: <Podcast className="w-5 h-5" />,
  },
  {
    name: '设置',
    href: ROUTES.SETTINGS,
    icon: <Settings className="w-5 h-5" />,
  },
];
