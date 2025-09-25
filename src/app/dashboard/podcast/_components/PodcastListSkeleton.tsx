'use client';

export function PodcastListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg bg-card animate-pulse">
          <div className="flex items-start gap-4">
            {/* 头像骨架 */}
            <div className="h-12 w-12 bg-muted rounded-full"></div>

            {/* 内容骨架 */}
            <div className="flex-1 space-y-3">
              {/* 标题骨架 */}
              <div className="h-5 bg-muted rounded w-3/4"></div>

              {/* 内容骨架 */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>

              {/* 展开按钮骨架 */}
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>

            {/* 播放按钮骨架 */}
            <div className="h-8 w-8 bg-muted rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
