'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import {
  MessageCircle,
  Users,
  FileText,
  Calendar,
  Video,
  Settings,
  MoreHorizontal,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}

const navItems: NavItem[] = [
  {
    name: '消息',
    href: '/dashboard/messages',
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    name: '日历',
    href: '/dashboard/calendar',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    name: '文档',
    href: '/docs',
    icon: <FileText className="w-5 h-5" />,
    external: true,
  },
  {
    name: '视频会议',
    href: '/dashboard/meeting',
    icon: <Video className="w-5 h-5" />,
  },
  {
    name: '通讯录',
    href: '/dashboard/contacts',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: '设置',
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    name: '更多',
    href: '/dashboard/more',
    icon: <MoreHorizontal className="w-5 h-5" />,
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">DF</span>
            </div>
            <span className="font-semibold text-gray-900">DocFlow</span>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = item.external
                ? false
                : pathname === item.href || pathname.startsWith(item.href + '/');

              const linkProps = item.external ? { href: item.href } : { href: item.href };

              const LinkComponent = item.external ? 'a' : Link;

              return (
                <li key={item.name}>
                  <LinkComponent
                    {...linkProps}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-blue-700' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </LinkComponent>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-medium text-sm">U</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">用户</p>
              <p className="text-xs text-gray-500">在线</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
