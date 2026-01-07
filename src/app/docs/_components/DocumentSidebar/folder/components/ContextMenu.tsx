import React from 'react';

import type { FileItem } from '@/types/file-system';
import { cn } from '@/utils';
import { Icon } from '@/components/ui/Icon';

interface ContextMenuProps {
  position: { x: number; y: number } | null;
  targetFile: FileItem | null;
  onClose: () => void;
  onCreateFile: (folderId: string) => void;
  onCreateFolder: (folderId: string) => void;
  onRename: (fileId: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  targetFile,
  onClose,
  onCreateFile,
  onCreateFolder,
  onRename,
}) => {
  if (!position) return null;

  const isFolder = targetFile?.type === 'folder';

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        className={cn(
          'fixed z-50 min-w-[200px] py-2 rounded-xl',
          'bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg',
          'border border-slate-200/60 dark:border-slate-700/60',
          'shadow-xl shadow-slate-900/10 dark:shadow-slate-900/40',
        )}
        style={{ top: position.y, left: position.x }}
      >
        {isFolder && (
          <>
            <button
              className={cn(
                'w-full text-left px-4 py-2.5 text-sm transition-all duration-200',
                'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50',
                'dark:hover:from-slate-700 dark:hover:to-slate-600',
                'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400',
                'flex items-center space-x-3',
              )}
              onClick={() => onCreateFile(targetFile.id)}
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <Icon name="FilePlus" className="h-3 w-3 text-white" />
              </div>
              <span>新建文件</span>
            </button>
            <button
              className={cn(
                'w-full text-left px-4 py-2.5 text-sm transition-all duration-200',
                'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50',
                'dark:hover:from-slate-700 dark:hover:to-slate-600',
                'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400',
                'flex items-center space-x-3',
              )}
              onClick={() => onCreateFolder(targetFile.id)}
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <Icon name="FolderPlus" className="h-3 w-3 text-white" />
              </div>
              <span>新建文件夹</span>
            </button>
            <div className="border-t border-slate-200/60 dark:border-slate-600/60 my-1" />
          </>
        )}
        <button
          className={cn(
            'w-full text-left px-4 py-2.5 text-sm transition-all duration-200',
            'hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50',
            'dark:hover:from-slate-700 dark:hover:to-slate-600',
            'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400',
            'flex items-center space-x-3',
          )}
          onClick={() => onRename(targetFile?.id || '')}
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Icon name="Pencil" className="h-3 w-3 text-white" />
          </div>
          <span>重命名</span>
        </button>
      </div>
    </>
  );
};

export default ContextMenu;
