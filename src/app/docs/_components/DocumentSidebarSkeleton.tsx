import { Skeleton } from '@/components/ui/skeleton';

interface DocumentSidebarSkeletonProps {
  width?: number;
}

export function DocumentSidebarSkeleton({ width = 320 }: DocumentSidebarSkeletonProps) {
  return (
    <div
      className="flex h-full relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/50 backdrop-blur-xl"
      style={{ width: `${width}px` }}
    >
      {/* 左侧图标栏骨架 */}
      <div className="w-16 relative bg-gradient-to-b from-white/90 via-white/70 to-white/90 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-800/90 backdrop-blur-lg flex flex-col items-center py-4 after:absolute after:right-0 after:top-4 after:bottom-4 after:w-px after:bg-gradient-to-b after:from-transparent after:via-slate-200/50 after:to-transparent dark:after:via-slate-600/30">
        {/* Logo骨架 */}
        <Skeleton className="w-10 h-10 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl mb-6" />

        {/* 按钮骨架 */}
        <div className="space-y-2 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-12 h-12 bg-white/60 dark:bg-slate-700/60 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-600/50"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* 底部按钮骨架 */}
        <Skeleton className="w-12 h-12 bg-white/60 dark:bg-slate-700/60 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-600/50" />
      </div>

      {/* 右侧内容区骨架 */}
      <div className="flex-1 overflow-hidden relative bg-gradient-to-br from-white/95 via-slate-50/60 to-white/95 dark:from-slate-800/95 dark:via-slate-800/70 dark:to-slate-800/95 backdrop-blur-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-4 before:bg-gradient-to-r before:from-slate-900/5 before:to-transparent dark:before:from-slate-900/20 before:pointer-events-none">
        <div className="h-full overflow-hidden flex flex-col">
          {/* 标题栏骨架 */}
          <header className="flex items-center justify-between px-5 py-4 relative bg-gradient-to-r from-white/95 via-slate-50/80 to-white/95 dark:from-slate-800/95 dark:via-slate-700/80 dark:to-slate-800/95 backdrop-blur-xl after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-gradient-to-r after:from-transparent after:via-slate-200/60 after:to-transparent dark:after:via-slate-600/40">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-xl" />
              <Skeleton className="h-4 w-16 bg-slate-200/60 dark:bg-slate-600/60 rounded-md" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-10 bg-slate-200/60 dark:bg-slate-600/60 rounded" />
              <Skeleton className="w-8 h-8 bg-white/60 dark:bg-slate-700/60 rounded-xl" />
            </div>
          </header>

          {/* 内容区骨架 */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <Skeleton className="h-6 bg-slate-200/60 dark:bg-slate-600/60 rounded-lg w-3/4" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-5 bg-slate-200/60 dark:bg-slate-600/60 rounded-md"
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
      <div className="absolute -right-4 top-0 bottom-0 w-4 pointer-events-none bg-gradient-to-r from-slate-900/10 to-transparent dark:from-slate-900/30" />
    </div>
  );
}
