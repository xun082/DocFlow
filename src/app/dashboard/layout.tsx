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
  const [sidebarOpen, setSidebarOpen] = useState(false); // 移动端默认关闭

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:shadow-sm 
          border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:w-64
        `}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">DF</span>
              </div>
              <span className="font-semibold text-gray-900">DocFlow</span>
            </div>
            {/* 移动端关闭按钮 */}
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
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
                    onClick={() => {
                      // 移动端点击导航项后关闭侧边栏
                      if (window.innerWidth < 1024) {
                        closeSidebar();
                      }
                    }}
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
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <DashboardHeader
          onMenuToggle={toggleSidebar}
          showMenuButton={true}
          pageTitle={getPageTitle(pathname)}
          key={pathname} // 添加 key 属性，确保路径变化时组件重新渲染
        />

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
