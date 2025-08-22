import React from 'react';

import { cn } from '@/utils/utils';

interface LoadingSkeletonProps {
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* 文件列表骨架 */}
      <div className="flex-1 overflow-hidden p-2 space-y-2">
        {Array.from({ length: 12 }).map((_, index) => {
          // 使用确定性的值替代随机值，避免水合问题
          const depth = index % 3;
          const isFolder = index % 5 === 0;
          const widthVariants = ['45%', '60%', '55%', '50%', '65%'];
          const width = widthVariants[index % widthVariants.length];

          return (
            <div
              key={index}
              className="flex items-center space-x-3 p-2 rounded-lg mx-2 animate-pulse"
              style={{
                paddingLeft: `${depth * 16 + 12}px`,
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* 展开图标骨架 */}
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-600 rounded"></div>

              {/* 文件图标骨架 */}
              <div
                className={cn(
                  'w-6 h-6 rounded-md',
                  isFolder
                    ? 'bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-600 dark:to-orange-700'
                    : 'bg-gradient-to-br from-blue-200 to-indigo-300 dark:from-blue-600 dark:to-indigo-700',
                )}
              ></div>

              {/* 文件名骨架 */}
              <div
                className="h-4 bg-slate-200 dark:bg-slate-600 rounded flex-1 max-w-[60%]"
                style={{ width }}
              ></div>

              {/* 操作按钮骨架 */}
              <div className="flex space-x-1 opacity-60">
                {isFolder && (
                  <>
                    <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded"></div>
                  </>
                )}
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分享文档区域骨架 */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3 animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
          <div className="w-4 h-4 bg-purple-200 dark:bg-purple-600 rounded"></div>
          <div className="w-20 h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
          <div className="w-6 h-4 bg-purple-200 dark:bg-purple-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
