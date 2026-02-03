'use client';

export function KnowledgeListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="p-6 border rounded-lg bg-card animate-pulse">
          <div className="space-y-4">
            {/* 标题骨架 */}
            <div className="h-6 bg-muted rounded w-3/4"></div>

            {/* 描述骨架 */}
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>

            {/* 底部信息骨架 */}
            <div className="flex items-center justify-between pt-4">
              <div className="h-4 bg-muted rounded w-16"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
