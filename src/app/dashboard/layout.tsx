'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Tour } from '@/components/tour';
import { TourProvider, useTour, type StepType } from '@/components/tour';
import { NotificationSocketProvider } from '@/providers/NotificationSocketProvider';
import { getPageTitle, NAV_ITEMS } from '@/utils';

// 本地存储 key（用于记录引导是否完成）
const DASHBOARD_TOUR_KEY = 'dashboard_tour_completed';

// 侧边栏导航项名称 -> 引导 step id 映射
const tourStepIdMap: Record<string, string> = {
  仪表盘: 'dashboard',
  聊天助手: 'messages',
  工作流: 'workflow',
  文档: 'docs',
  知识库: 'knowledge',
  通讯录: 'contacts',
  组织管理: 'organizations',
  个人资料: 'user',
  播客: 'podcast',
  设置: 'settings',
};

// Tour 步骤配置（针对每个侧边栏导航项）
const tourSteps: StepType[] = [
  {
    selector: '[data-tour-step-id="dashboard"]',
    content: '仪表盘用于展示系统概览和关键指标，帮助你快速了解当前工作状态。',
  },
  {
    selector: '[data-tour-step-id="messages"]',
    content: '聊天助手提供 AI 对话能力，支持智能问答、写作辅助等功能。',
  },
  {
    selector: '[data-tour-step-id="workflow"]',
    content: '工作流模块用于配置和管理自动化流程，让重复性工作自动执行。',
  },
  {
    selector: '[data-tour-step-id="docs"]',
    content: '文档模块用于文档的编辑和管理，是协作文档的核心入口。',
  },
  {
    selector: '[data-tour-step-id="knowledge"]',
    content: '知识库用于沉淀和管理结构化知识，支持检索和复用知识内容。',
  },
  {
    selector: '[data-tour-step-id="contacts"]',
    content: '通讯录用于管理联系人、同事及外部联系人，方便快速协作与沟通。',
  },
  {
    selector: '[data-tour-step-id="organizations"]',
    content: '组织管理用于管理组织架构、成员与权限，是企业级协作的基础配置。',
  },
  {
    selector: '[data-tour-step-id="user"]',
    content: '个人资料页面用于设置个人信息、账号与偏好。',
  },
  {
    selector: '[data-tour-step-id="podcast"]',
    content: '播客模块提供播客相关能力，用于创建和管理播客内容。',
  },
  {
    selector: '[data-tour-step-id="settings"]',
    content: '设置模块用于配置系统级参数，例如语言、主题和高级选项。',
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false); // 移动端默认关闭

  const { isOpen, setIsOpen } = useTour();
  const [autoStarted, setAutoStarted] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // 首次访问自动触发引导
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasCompleted = window.localStorage.getItem(DASHBOARD_TOUR_KEY);
    console.error(hasCompleted);

    if (!hasCompleted) {
      setIsOpen(true);
      setAutoStarted(true);
    }
  }, [setIsOpen]);

  // 自动启动的引导关闭后，记录已完成状态
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isOpen && autoStarted) {
      window.localStorage.setItem(DASHBOARD_TOUR_KEY, 'true');
    }
  }, [isOpen, autoStarted]);

  // 手动重新开始引导：清除完成状态并打开
  const handleStartTour = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DASHBOARD_TOUR_KEY);
    }

    setAutoStarted(false);
    setIsOpen(true);
  };

  return (
    <>
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
                type="button"
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

            {/* 开始引导 */}
            <button
              type="button"
              onClick={handleStartTour}
              className="mt-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              开始引导
            </button>
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

                const linkClasses = `
                  group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `;

                const linkContent = (
                  <>
                    <span
                      className={`
                        mr-3 transition-colors duration-200
                        ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </>
                );

                const tourStepId = tourStepIdMap[item.name] ?? undefined;

                return (
                  <li key={item.name}>
                    {item.external ? (
                      <a
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            closeSidebar();
                          }
                        }}
                        className={linkClasses}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-tour-step-id={tourStepId}
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        prefetch={false}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            closeSidebar();
                          }
                        }}
                        className={linkClasses}
                        data-tour-step-id={tourStepId}
                      >
                        {linkContent}
                      </Link>
                    )}
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

      {/* Tour 覆盖层/提示框 */}
      <Tour />
    </>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <NotificationSocketProvider>
      <TourProvider steps={tourSteps}>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </TourProvider>
    </NotificationSocketProvider>
  );
}
