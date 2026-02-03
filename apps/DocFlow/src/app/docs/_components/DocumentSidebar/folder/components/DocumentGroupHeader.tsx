import React from 'react';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils';

interface DocumentGroupHeaderProps {
  name: string;
  type: 'personal' | 'organization' | 'shared';
  isExpanded: boolean;
  fileCount: number;
  onToggle: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}

const DocumentGroupHeader: React.FC<DocumentGroupHeaderProps> = ({
  name,
  type,
  isExpanded,
  fileCount,
  onToggle,
  onCreateFile,
  onCreateFolder,
}) => {
  const getGroupIcon = () => {
    switch (type) {
      case 'personal':
        return 'User';
      case 'organization':
        return 'Users';
      case 'shared':
        return 'Share2';
      default:
        return 'Folder';
    }
  };

  const getGroupColor = () => {
    switch (type) {
      case 'personal':
        return 'from-blue-500 to-indigo-600';
      case 'organization':
        return 'from-purple-500 to-pink-600';
      case 'shared':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2.5 mx-2 my-1',
        'cursor-pointer select-none group',
        'rounded-lg transition-all duration-200',
        'hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/80',
        'dark:hover:from-slate-700/50 dark:hover:to-slate-800/50',
        'border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50',
      )}
      onClick={onToggle}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {/* 展开/折叠图标 */}
        <div
          className={cn(
            'w-4 h-4 flex-shrink-0 transition-transform duration-200',
            isExpanded ? 'rotate-90' : 'rotate-0',
          )}
        >
          <Icon name="ChevronRight" className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>

        {/* 分组图标 */}
        <div
          className={cn(
            'w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0',
            'bg-gradient-to-br shadow-sm',
            getGroupColor(),
          )}
        >
          <Icon name={getGroupIcon() as any} className="w-3 h-3 text-white" />
        </div>

        {/* 分组名称 */}
        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate uppercase tracking-wide">
          {name}
        </span>

        {/* 文件数量 */}
        <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
          ({fileCount})
        </span>
      </div>

      {/* 快捷操作按钮 - 仅个人和组织文档显示 */}
      {(type === 'personal' || type === 'organization') && (
        <div
          className={cn(
            'flex items-center space-x-1 opacity-0 group-hover:opacity-100',
            'transition-all duration-200',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title="新建文件"
            className={cn(
              'p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110',
              'hover:bg-blue-100 dark:hover:bg-slate-600',
              'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400',
            )}
            onClick={(e) => {
              e.stopPropagation();
              onCreateFile?.();
            }}
          >
            <Icon name="FilePlus" className="h-3.5 w-3.5" />
          </button>
          <button
            title="新建文件夹"
            className={cn(
              'p-1.5 rounded-lg transition-all duration-200 transform hover:scale-110',
              'hover:bg-blue-100 dark:hover:bg-slate-600',
              'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400',
            )}
            onClick={(e) => {
              e.stopPropagation();
              onCreateFolder?.();
            }}
          >
            <Icon name="FolderPlus" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentGroupHeader;
