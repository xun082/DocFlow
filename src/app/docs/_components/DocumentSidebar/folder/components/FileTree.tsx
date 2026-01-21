import React, { useRef } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { RenderFile } from './RenderFile';
import PortalOverlay from './PortalOverlay';

import type { FileItem } from '@/types/file-system';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils';

export interface FileTreeProps {
  files: FileItem[];
  expandedFolders: Record<string, boolean>;
  selectedFileId: string | null;
  isRenaming: string | null;
  newItemFolder: string | null;
  newItemType: 'file' | 'folder' | null;
  projected: any;
  dndState: {
    overId: string | null;
    activeId: string | null;
  };
  newItemName: string;
  onFileSelect: (file: FileItem, e: React.MouseEvent) => void;
  onToggleFolder: (folderId: string, e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent, fileId: string) => void;
  closeContextMenu: () => void;
  onStartCreateNewItem: (folderId: string, type: 'file' | 'folder') => void;
  onFinishRenaming: (newName: string) => void;
  onFinishCreateNewItem: () => void;
  onCancelCreateNewItem: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSetNewItemName: (name: string) => void;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDuplicate: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

const FileTree: React.FC<FileTreeProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    files,
    newItemFolder,
    projected,
    newItemType,
    newItemName,
    dndState,
    onFinishCreateNewItem,
    onCancelCreateNewItem,
    onKeyDown,
    onSetNewItemName,
  } = props;
  const fileSordId = files.map((file) => file.id);
  const activeFile = files.find(({ id }) => id === dndState.activeId);

  // 渲染顶级新建输入框
  const renderNewRootItem = () => {
    if (newItemFolder !== 'root') return null;

    return (
      <div
        data-new-item-container
        className={cn(
          'flex items-center py-2 px-3 text-sm mx-2 my-0.5',
          'bg-gradient-to-r from-green-50 via-emerald-50/80 to-green-50',
          'dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20',
          'border border-green-200/60 dark:border-green-700/50 rounded-lg',
          'shadow-md shadow-green-200/20 dark:shadow-green-800/20',
          'overflow-hidden', // 防止内容溢出
        )}
        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
      >
        <div className="w-6 h-6 mr-2 flex-shrink-0 flex items-center justify-center">
          <div
            className={cn(
              'w-5 h-5 rounded-md flex items-center justify-center',
              'bg-gradient-to-br from-emerald-400 to-green-500',
              'shadow-md shadow-emerald-500/30',
            )}
          >
            <Icon
              name={newItemType === 'folder' ? 'Folder' : 'FileText'}
              className="h-3.5 w-3.5 text-white drop-shadow-sm"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center space-x-2 min-w-0">
          {' '}
          {/* 添加 min-w-0 防止溢出 */}
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'flex-1 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm',
              'border-2 border-green-400/70 dark:border-green-500/70',
              'focus:border-green-500 dark:focus:border-green-400',
              'focus:ring-2 focus:ring-green-500/30 dark:focus:ring-green-400/30',
              'px-3 py-2 text-sm rounded-lg transition-all duration-300',
              'text-slate-900 dark:text-slate-100',
              'shadow-lg shadow-green-200/30 dark:shadow-green-800/20',
              'min-w-0', // 防止输入框过宽
            )}
            value={newItemName}
            onChange={(e) => onSetNewItemName(e.target.value)}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()} // 阻止点击输入框时退出
            autoFocus
            placeholder={`${newItemType === 'folder' ? '文件夹' : '文件'}名称`}
          />
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              className={cn(
                'p-2 rounded-xl transition-all duration-300 transform hover:scale-110',
                'bg-gradient-to-br from-green-500 to-emerald-600',
                'text-white shadow-lg shadow-green-500/30',
                'hover:from-green-600 hover:to-emerald-700',
              )}
              onClick={() => onFinishCreateNewItem()}
              title="确认"
            >
              <Icon name="Check" className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn(
                'p-2 rounded-xl transition-all duration-300 transform hover:scale-110',
                'bg-gradient-to-br from-red-500 to-pink-600',
                'text-white shadow-lg shadow-red-500/30',
                'hover:from-red-600 hover:to-pink-700',
              )}
              onClick={onCancelCreateNewItem}
              title="取消"
            >
              <Icon name="X" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-2">
      <SortableContext strategy={verticalListSortingStrategy} items={fileSordId}>
        {files.map((file) => (
          <RenderFile
            inputRef={inputRef}
            {...props}
            key={file.id}
            file={file}
            depth={file.id === dndState.activeId && projected ? projected.depth : file.depth}
            id={file.id}
          />
        ))}
        {typeof window !== 'undefined' && <PortalOverlay activeFile={activeFile!} {...props} />}
      </SortableContext>

      {renderNewRootItem()}
    </div>
  );
};

export default FileTree;
