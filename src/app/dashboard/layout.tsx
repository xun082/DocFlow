'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getPageTitle, NAV_ITEMS } from '@/utils/constants/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white shadow-sm border-r border-gray-200 flex flex-col lg:w-64 lg:block ${sidebarOpen ? 'block' : 'hidden lg:block'}`}
      >
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
            {NAV_ITEMS.map((item) => {
              // 判断当前项是否激活
              const isActive =
                !item.external &&
                (pathname === item.href ||
                  (pathname.startsWith(item.href + '/') && item.href !== '/dashboard') ||
                  (item.href === '/dashboard' && pathname === '/dashboard'));

              // 根据是否为外部链接选择合适的组件
              const NavLink = item.external ? 'a' : Link;

              return (
                <li key={item.name}>
                  <NavLink
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-in-out
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                  >
                    <span
                      className={`
                        mr-3 transition-colors duration-200
                        ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          onMenuToggle={toggleSidebar}
          showMenuButton={true}
          pageTitle={getPageTitle(pathname)}
          key={pathname} // 添加 key 属性，确保路径变化时组件重新渲染
        />
        {/* 调试信息 */}
        <div className="hidden">
          当前路径: {pathname}, 标题: {getPageTitle(pathname)}
        </div>

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
