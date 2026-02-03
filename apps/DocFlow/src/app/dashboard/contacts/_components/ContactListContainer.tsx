'use client';

import { ReactNode } from 'react';

interface ContactListContainerProps {
  title: string;
  action?: ReactNode;
  searchBar?: ReactNode;
  children: ReactNode;
}

export default function ContactListContainer({
  title,
  action,
  searchBar,
  children,
}: ContactListContainerProps) {
  return (
    <div className="flex-1 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 头部区域 */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* 标题和操作按钮 */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {action && <div>{action}</div>}
        </div>

        {/* 搜索框 */}
        {searchBar && <div>{searchBar}</div>}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
