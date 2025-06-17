'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DynamicTabSidebar = dynamic(() => import('@/components/layout/TabSidebar'), {
  ssr: false,
  loading: () => (
    <div className="w-80 bg-gray-50 border-r border-gray-200 animate-pulse">
      <div className="p-4 space-y-4">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  ),
});

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen" suppressHydrationWarning>
      {/* 预留侧边栏空间，避免布局跳动 */}
      {mounted && (
        <div
          className={`transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}
        >
          <DynamicTabSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        </div>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
