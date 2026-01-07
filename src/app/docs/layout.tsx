'use client';

import { Suspense } from 'react';

import { DocumentSidebarSkeleton } from './_components/DocumentSidebarSkeleton';
import DocumentSidebar from './_components/DocumentSidebar';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div
      className="flex h-screen bg-white dark:bg-slate-900 overflow-hidden"
      suppressHydrationWarning
    >
      {/* 侧边栏区域 - 可调整宽度设计 */}
      <Suspense fallback={<DocumentSidebarSkeleton />}>
        <DocumentSidebar />
      </Suspense>

      {/* 主内容区域 */}
      <main
        className="flex-1 bg-white dark:bg-slate-900 relative min-w-0 overflow-hidden"
        suppressHydrationWarning
      >
        {/* 左侧柔和分隔阴影 */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-900/5 to-transparent dark:from-slate-900/20 pointer-events-none z-10" />
        <div className="w-full h-full" suppressHydrationWarning>
          {children}
        </div>
      </main>
    </div>
  );
}
