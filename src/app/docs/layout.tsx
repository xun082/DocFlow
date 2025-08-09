import { Suspense } from 'react';

import DocumentSidebar from '@/app/docs/_components/DocumentSidebar';

// 优化的加载组件 - 与 TabSidebar 保持一致的样式
function SidebarSkeleton() {
  return (
    <div
      className="relative flex h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 shadow-2xl shadow-slate-200/30 backdrop-blur-xl dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 dark:shadow-slate-900/50"
      style={{ width: '320px' }} // 默认宽度
    >
      {/* 左侧图标栏骨架 */}
      <div className="relative flex w-16 flex-col items-center bg-gradient-to-b from-white/90 via-white/70 to-white/90 py-4 backdrop-blur-lg after:absolute after:top-4 after:right-0 after:bottom-4 after:w-px after:bg-gradient-to-b after:from-transparent after:via-slate-200/50 after:to-transparent dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-800/90 dark:after:via-slate-600/30">
        {/* Logo骨架 */}
        <div className="mb-6 h-10 w-10 animate-pulse rounded-2xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20" />

        {/* 按钮骨架 */}
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-12 animate-pulse rounded-2xl border border-slate-200/50 bg-white/60 backdrop-blur-md dark:border-slate-600/50 dark:bg-slate-700/60"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* 底部按钮骨架 */}
        <div className="h-12 w-12 animate-pulse rounded-2xl border border-slate-200/50 bg-white/60 backdrop-blur-md dark:border-slate-600/50 dark:bg-slate-700/60" />
      </div>

      {/* 右侧内容区骨架 */}
      <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-white/95 via-slate-50/60 to-white/95 backdrop-blur-lg before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-0 before:w-4 before:bg-gradient-to-r before:from-slate-900/5 before:to-transparent dark:from-slate-800/95 dark:via-slate-800/70 dark:to-slate-800/95 dark:before:from-slate-900/20">
        <div className="flex h-full flex-col overflow-hidden">
          {/* 标题栏骨架 */}
          <header className="relative flex items-center justify-between bg-gradient-to-r from-white/95 via-slate-50/80 to-white/95 px-5 py-4 backdrop-blur-xl after:absolute after:right-4 after:bottom-0 after:left-4 after:h-px after:bg-gradient-to-r after:from-transparent after:via-slate-200/60 after:to-transparent dark:from-slate-800/95 dark:via-slate-700/80 dark:to-slate-800/95 dark:after:via-slate-600/40">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 animate-pulse rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20" />
              <div className="h-4 w-16 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-600/60" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-10 animate-pulse rounded bg-slate-200/60 dark:bg-slate-600/60" />
              <div className="h-8 w-8 animate-pulse rounded-xl bg-white/60 dark:bg-slate-700/60" />
            </div>
          </header>

          {/* 内容区骨架 */}
          <div className="flex-1 space-y-4 overflow-auto p-4">
            <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-600/60" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-600/60"
                  style={{
                    width: `${60 + ((i * 7) % 30)}%`,
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 整体右侧柔和阴影 */}
      <div className="pointer-events-none absolute top-0 -right-4 bottom-0 w-4 bg-gradient-to-r from-slate-900/10 to-transparent dark:from-slate-900/30" />
    </div>
  );
}

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900">
      {/* 侧边栏区域 - 可调整宽度设计 */}
      <Suspense fallback={<SidebarSkeleton />}>
        <DocumentSidebar />
      </Suspense>

      {/* 主内容区域 */}
      <main className="relative min-w-0 flex-1 overflow-hidden bg-white dark:bg-slate-900">
        {/* 左侧柔和分隔阴影 */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-6 bg-gradient-to-r from-slate-900/5 to-transparent dark:from-slate-900/20" />
        <div className="h-full w-full">{children}</div>
      </main>
    </div>
  );
}
