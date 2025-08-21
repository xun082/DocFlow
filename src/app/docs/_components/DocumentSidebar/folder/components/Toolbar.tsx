import React from 'react';

import { cn } from '@/utils/utils';
import { Icon } from '@/components/ui/Icon';

interface ToolbarProps {
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onRefresh: () => void;
  onCollapseAll: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onCreateFile,
  onCreateFolder,
  onRefresh,
  onCollapseAll,
}) => {
  const toolbarItems = [
    {
      icon: 'FilePlus',
      action: onCreateFile,
      tooltip: '新建文件',
      color: 'blue',
    },
    {
      icon: 'FolderPlus',
      action: onCreateFolder,
      tooltip: '新建文件夹',
      color: 'yellow',
    },
    {
      icon: 'RefreshCw',
      action: onRefresh,
      tooltip: '刷新',
      color: 'green',
    },
    {
      icon: 'FolderMinus',
      action: onCollapseAll,
      tooltip: '折叠所有',
      color: 'slate',
    },
  ];

  return (
    <div
      className={cn(
        'p-4 space-y-4',
        'bg-gradient-to-r from-white/90 via-slate-50/70 to-white/90',
        'dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/90',
        'border-b border-slate-200/60 dark:border-slate-700/60',
        'backdrop-blur-xl',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {toolbarItems.map((item, index) => (
            <div key={item.icon} className="relative group">
              <button
                className={cn(
                  'p-2 rounded-xl transition-all duration-300 transform hover:scale-110 group/btn',
                  'bg-white/80 dark:bg-slate-700/80 backdrop-blur-md',
                  'hover:shadow-lg border border-slate-200/50 dark:border-slate-600/50',
                  item.color === 'blue' &&
                    'hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 hover:border-blue-300/50',
                  item.color === 'yellow' &&
                    'hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 hover:text-amber-600 hover:border-amber-300/50',
                  item.color === 'green' &&
                    'hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:text-green-600 hover:border-green-300/50',
                  item.color === 'slate' &&
                    'hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 hover:text-slate-700 hover:border-slate-300/50',
                  'dark:hover:from-slate-600/80 dark:hover:to-slate-700/80 dark:hover:text-slate-200',
                  'text-slate-600 dark:text-slate-400',
                )}
                onClick={item.action}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon
                  name={item.icon as any}
                  className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110"
                />
              </button>

              <div
                className={cn(
                  'absolute top-full mt-2 left-1/2 transform -translate-x-1/2',
                  'px-2 py-1 rounded-lg text-xs font-medium',
                  'bg-slate-800 dark:bg-slate-700 text-white',
                  'shadow-lg shadow-slate-900/20',
                  'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100',
                  'transition-all duration-200 pointer-events-none',
                  'whitespace-nowrap z-50',
                )}
              >
                {item.tooltip}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
