import React, { Ref, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import FileItemMenu from '../FileItemMenu';
import { useFileActions } from '../hooks/useFileActions';

import type { FileItem } from '@/types/file-system';
import { useFileStore } from '@/stores/fileStore';
import { cn } from '@/utils';
import { Icon } from '@/components/ui/Icon';

export const RenderFile: React.FC<{
  file: FileItem;
  isOverlay?: boolean;
  depth?: number;
  inputRef?: Ref<HTMLInputElement>;
  id: string;
  groupId?: string;
  onFileSelect: (file: FileItem, e: React.MouseEvent) => void;
  onToggleFolder: (folderId: string, e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent, fileId: string) => void;
  closeContextMenu: () => void;
  onFinishRenaming: (newName: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onRename: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onDuplicate: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}> = ({
  file,
  inputRef,
  depth = 0,
  id,
  groupId,
  isOverlay,
  onFileSelect,
  onToggleFolder,
  onContextMenu,
  closeContextMenu,
  onFinishRenaming,
  onKeyDown,
  onRename,
  onShare,
  onDelete,
  onDuplicate,
  onDownload,
}): React.ReactElement => {
  // Use store state directly
  const {
    expandedFolders,
    selectedFileId,
    isRenaming,
    newItemFolder,
    newItemGroupId,
    newItemType,
    newItemName,
    setNewItemName,
  } = useFileStore();

  // Use file actions hook
  const { startCreateNewItem, finishCreateNewItem, cancelCreateNewItem } = useFileActions();

  const isFolder = file.type === 'folder';
  const isExpanded = isFolder && expandedFolders[file.id];
  const isSelected = selectedFileId === file.id;
  const isItemRenaming = isRenaming === file.id;
  const isAddingNewItem = newItemFolder === file.id && newItemGroupId === groupId;

  const FileItemHeight = 46;

  // 计算有多少个子文件 渲染侧边连接线高度
  const folderLineHeight = (() => {
    if (typeof expandedFolders[file.id] != 'undefined' && expandedFolders[file.id]) {
      return file.children!.length * FileItemHeight;
    }
  })();

  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    data: {
      id: id,
      isFolder,
      isExpanded,
    },
  });

  const style = {
    transform: isExpanded ? '' : CSS.Transform.toString(transform),
    transition,
  };

  // 当进入重命名状态时自动聚焦
  useEffect(() => {
    if (isItemRenaming && inputRef && typeof inputRef === 'object' && 'current' in inputRef) {
      inputRef.current?.focus();
      // 选中所有文本，方便用户直接输入
      inputRef.current?.select();
    }
  }, [isItemRenaming, inputRef]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        // Wrapper styles - left padding based on depth
        'relative',
        // Drag indicator styles
        isDragging && [
          'opacity-100 relative z-[1] -mb-px',
          // TreeItem drag styles
          '[&>div>div]:relative [&>div>div]:p-0 [&>div>div]:h-[5px]',
          '[&>div>div]:border-[oklch(0.81_0.1_252)] [&>div>div]:bg-[oklch(0.79_0.1_275)]',
          '[&>div>div]:before:absolute [&>div>div]:before:left-[-8px] [&>div>div]:before:top-[-4px]',
          '[&>div>div]:before:block [&>div>div]:before:content-[""] [&>div>div]:before:w-3 [&>div>div]:before:h-3',
          '[&>div>div>*]:opacity-0 [&>div>div>*]:h-0',
        ],
      )}
      style={{ paddingLeft: `${(depth === 0 ? 1 : depth) * 20}px` }}
    >
      <div style={style} {...listeners}>
        <div
          className={cn(
            'flex items-center py-2 px-3 text-sm cursor-pointer relative group box-border',
            'transition-all duration-300 ease-out rounded-lg mx-2 my-0.5 hover:z-[100]',
            isSelected && [
              'bg-blue-500/10 dark:bg-blue-400/15',
              'text-blue-700 dark:text-blue-300',
              'border-2 border-blue-500 dark:border-blue-400',
              'shadow-sm shadow-blue-500/20',
            ],
            !isSelected && [
              'hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-blue-100/60 hover:to-blue-50/80',
              'dark:hover:from-blue-900/20 dark:hover:via-blue-800/30 dark:hover:to-blue-900/20',
              'hover:shadow-md hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30',
              'hover:transform hover:scale-[1.01]',
              'text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300',
              'border-2 border-transparent',
            ],
            isOverlay && 'border-lime-500 border-2',
          )}
          style={{
            animationDelay: `${depth * 50}ms`,
          }}
          onClick={(e) => (isFolder ? onToggleFolder(file.id, e) : onFileSelect(file, e))}
          onContextMenu={(e) => onContextMenu(e, file.id)}
        >
          {/* 展开/折叠图标 - 只为文件夹显示 */}
          {isFolder && (
            <div className="mr-2 w-5 h-5 flex-shrink-0 flex items-center justify-center">
              <button
                className={cn(
                  'w-5 h-5 rounded-md flex items-center justify-center group/chevron',
                  'transition-all duration-300 transform hover:scale-110',
                  isSelected
                    ? 'hover:bg-blue-100/50 text-blue-600 hover:text-blue-700'
                    : 'hover:bg-blue-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFolder(file.id, e);
                }}
              >
                <Icon
                  name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                  className={cn(
                    'h-3.5 w-3.5 transition-all duration-300',
                    'group-hover/chevron:scale-110 drop-shadow-sm',
                    isExpanded && 'transform rotate-0',
                    !isExpanded && 'transform rotate-0',
                  )}
                />
              </button>
            </div>
          )}

          {/* 文件/文件夹图标 - 更精美的设计 */}
          <div className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center">
            {isFolder ? (
              <div
                className={cn(
                  'w-5 h-5 rounded-md flex items-center justify-center',
                  'transition-all duration-300 group-hover:scale-110',
                  isExpanded
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30'
                    : 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md shadow-yellow-500/30',
                )}
              >
                <Icon
                  name={isExpanded ? 'FolderOpen' : 'Folder'}
                  className="h-3.5 w-3.5 text-white drop-shadow-sm"
                />
              </div>
            ) : (
              <div
                className={cn(
                  'w-5 h-5 rounded-md flex items-center justify-center',
                  'bg-gradient-to-br from-blue-400 to-indigo-500',
                  'shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:scale-110',
                )}
              >
                <Icon name="FileText" className="h-3.5 w-3.5 text-white drop-shadow-sm" />
              </div>
            )}
          </div>

          {/* 名称/重命名输入框 - 美化样式 */}
          <div className="flex-1 min-w-0 mr-3">
            <input
              ref={inputRef}
              type="text"
              readOnly={!isItemRenaming}
              className={cn(
                'w-full text-sm rounded-lg transition-all duration-300 font-medium',
                'outline-none border-2',
                isItemRenaming
                  ? [
                      // 编辑状态
                      'bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm',
                      'border-blue-400/70 dark:border-blue-500/70',
                      'focus:border-blue-500 dark:focus:border-blue-400',
                      'focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30',
                      'px-2 py-1',
                      'text-slate-900 dark:text-slate-100',
                      'shadow-lg shadow-blue-200/30 dark:shadow-blue-800/20',
                      'cursor-text',
                    ]
                  : [
                      // 只读状态（看起来像普通文本）
                      'bg-transparent border-transparent',
                      'px-0 py-0',
                      'cursor-pointer pointer-events-none',
                      'truncate',
                      isSelected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300',
                    ],
              )}
              defaultValue={file.name}
              onBlur={(e) => {
                if (!isItemRenaming) return;

                const newValue = e.target.value.trim();

                // 只有值改变且不为空时才触发更新
                if (newValue && newValue !== file.name) {
                  onFinishRenaming(newValue);
                } else if (!newValue) {
                  // 如果为空，恢复原值
                  e.target.value = file.name;
                }
              }}
              onKeyDown={onKeyDown}
            />
          </div>

          {/* 快捷操作按钮区域 - 更精美的设计 */}
          <div
            className={cn(
              'flex items-center space-x-1 opacity-0 group-hover:opacity-100',
              'transition-all duration-300 transform translate-x-2 group-hover:translate-x-0',
            )}
          >
            {/* 文件夹快捷操作按钮 */}
            {isFolder && groupId && (
              <>
                <button
                  title="新建文件"
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110',
                    isSelected
                      ? 'hover:bg-blue-100/50 text-blue-600 hover:text-blue-700'
                      : 'hover:bg-blue-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400',
                    'shadow-sm hover:shadow-md',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreateNewItem(file.id, 'file', groupId);
                  }}
                >
                  <Icon name="FilePlus" className="h-3.5 w-3.5" />
                </button>
                <button
                  title="新建文件夹"
                  className={cn(
                    'p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110',
                    isSelected
                      ? 'hover:bg-blue-100/50 text-blue-600 hover:text-blue-700'
                      : 'hover:bg-blue-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400',
                    'shadow-sm hover:shadow-md',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreateNewItem(file.id, 'folder', groupId);
                  }}
                >
                  <Icon name="FolderPlus" className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {/* 三个点菜单 */}
            <div className={cn('transition-all duration-300 transform hover:scale-110')}>
              <FileItemMenu
                file={file}
                onShare={onShare}
                onDelete={onDelete}
                onRename={onRename}
                onDuplicate={onDuplicate}
                onDownload={onDownload}
                onMenuOpen={closeContextMenu}
                className={cn(
                  'p-1.5 rounded-lg',
                  isSelected
                    ? 'hover:bg-blue-100/50 text-blue-600 hover:text-blue-700'
                    : 'hover:bg-blue-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400',
                )}
              />
            </div>
          </div>

          {/* 选中状态的光晕效果 */}
          {isSelected && (
            <div
              className={cn(
                'absolute inset-0 rounded-lg pointer-events-none',
                'bg-blue-500/5 dark:bg-blue-400/8',
              )}
            />
          )}
        </div>
        {/* 如果是展开的文件夹，则递归渲染其子项 */}
        {isFolder && isExpanded && (
          <div className=" relative">
            {/* 连接线 */}
            <div
              className={cn(
                `absolute left-6   w-px`,
                'bg-gradient-to-b from-slate-200 via-slate-300 to-transparent',
                'dark:from-slate-600 dark:via-slate-500',
              )}
              style={{ marginLeft: `${depth * 16}px`, height: `${folderLineHeight}px` }}
            ></div>
            <div className="relative">
              {/* 新建项目输入框 */}
              {isAddingNewItem && (
                <div
                  className={cn(
                    'flex items-center py-2 px-3 text-sm mx-2 my-0.5',
                    'bg-gradient-to-r from-green-50 via-emerald-50/80 to-green-50',
                    'dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20',
                    'border border-green-200/60 dark:border-green-700/50 rounded-lg',
                    'shadow-md shadow-green-200/20 dark:shadow-green-800/20',
                  )}
                  style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
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
                  <div className="flex-1 flex items-center space-x-2">
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
                      )}
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={onKeyDown}
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
                        onClick={() => finishCreateNewItem()}
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
                        onClick={cancelCreateNewItem}
                        title="取消"
                      >
                        <Icon name="X" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
