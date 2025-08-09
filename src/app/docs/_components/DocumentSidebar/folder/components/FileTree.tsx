import React, { useRef } from 'react';

import { FileItem } from '../type';
import FileItemMenu from '../FileItemMenu';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

interface FileTreeProps {
  files: FileItem[];
  expandedFolders: Record<string, boolean>;
  selectedFileId: string | null;
  isRenaming: string | null;
  newItemFolder: string | null;
  newItemType: 'file' | 'folder' | null;
  newItemName: string;
  onFileSelect: (file: FileItem, e: React.MouseEvent) => void;
  onToggleFolder: (folderId: string, e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent, fileId: string) => void;
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

const FileTree: React.FC<FileTreeProps> = ({
  files,
  expandedFolders,
  selectedFileId,
  isRenaming,
  newItemFolder,
  newItemType,
  newItemName,
  onFileSelect,
  onToggleFolder,
  onContextMenu,
  onStartCreateNewItem,
  onFinishRenaming,
  onFinishCreateNewItem,
  onCancelCreateNewItem,
  onKeyDown,
  onSetNewItemName,
  onShare,
  onDelete,
  onRename,
  onDuplicate,
  onDownload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 渲染单个文件或文件夹
  const renderFile = (file: FileItem, depth = 0): React.ReactNode => {
    const isFolder = file.type === 'folder';
    const isExpanded = isFolder && expandedFolders[file.id];
    const isSelected = selectedFileId === file.id;
    const isItemRenaming = isRenaming === file.id;
    const isAddingNewItem = newItemFolder === file.id;

    return (
      <div key={file.id}>
        <div
          className={cn(
            'group relative box-border flex cursor-pointer items-center px-3 py-2 text-sm',
            'mx-2 my-0.5 rounded-lg transition-all duration-300 ease-out hover:z-[100]',
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
              'hover:scale-[1.01] hover:transform',
              'text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300',
              'border-2 border-transparent',
            ],
          )}
          style={{
            paddingLeft: `${depth * 16 + 12}px`,
            animationDelay: `${depth * 50}ms`,
          }}
          onClick={(e) => (isFolder ? onToggleFolder(file.id, e) : onFileSelect(file, e))}
          onContextMenu={(e) => onContextMenu(e, file.id)}
        >
          {/* 展开/折叠图标 - 精美设计 */}
          <div className="mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center">
            {isFolder && (
              <button
                className={cn(
                  'group/chevron flex h-5 w-5 items-center justify-center rounded-md',
                  'transform transition-all duration-300 hover:scale-110',
                  isSelected
                    ? 'text-blue-600 hover:bg-blue-100/50 hover:text-blue-700'
                    : 'text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-blue-400',
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
                    'drop-shadow-sm group-hover/chevron:scale-110',
                    isExpanded && 'rotate-0 transform',
                    !isExpanded && 'rotate-0 transform',
                  )}
                />
              </button>
            )}
          </div>

          {/* 文件/文件夹图标 - 更精美的设计 */}
          <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center">
            {isFolder ? (
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md',
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
                  'flex h-5 w-5 items-center justify-center rounded-md',
                  'bg-gradient-to-br from-blue-400 to-indigo-500',
                  'shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:scale-110',
                )}
              >
                <Icon name="FileText" className="h-3.5 w-3.5 text-white drop-shadow-sm" />
              </div>
            )}
          </div>

          {/* 名称/重命名输入框 - 美化样式 */}
          <div className="mr-3 min-w-0 flex-1">
            {isItemRenaming ? (
              <input
                ref={inputRef}
                type="text"
                className={cn(
                  'w-full bg-white/90 backdrop-blur-sm dark:bg-slate-700/90',
                  'border-2 border-blue-400/70 dark:border-blue-500/70',
                  'focus:border-blue-500 dark:focus:border-blue-400',
                  'focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30',
                  'rounded-lg px-2 py-1 text-sm transition-all duration-300',
                  'text-slate-900 dark:text-slate-100',
                  'shadow-lg shadow-blue-200/30 dark:shadow-blue-800/20',
                )}
                defaultValue={file.name}
                onBlur={(e) => onFinishRenaming(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
              />
            ) : (
              <span
                className={cn(
                  'block truncate font-medium transition-all duration-300',
                  isSelected
                    ? 'font-medium text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 group-hover:text-blue-700 dark:text-slate-300 dark:group-hover:text-blue-300',
                )}
              >
                {file.name}
              </span>
            )}
          </div>

          {/* 快捷操作按钮区域 - 更精美的设计 */}
          <div
            className={cn(
              'flex items-center space-x-1 opacity-0 group-hover:opacity-100',
              'translate-x-2 transform transition-all duration-300 group-hover:translate-x-0',
            )}
          >
            {/* 文件夹快捷操作按钮 */}
            {isFolder && (
              <>
                <button
                  title="新建文件"
                  className={cn(
                    'transform rounded-lg p-1.5 transition-all duration-300 hover:scale-110',
                    isSelected
                      ? 'text-blue-600 hover:bg-blue-100/50 hover:text-blue-700'
                      : 'text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-blue-400',
                    'shadow-sm hover:shadow-md',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreateNewItem(file.id, 'file');
                  }}
                >
                  <Icon name="FilePlus" className="h-3.5 w-3.5" />
                </button>
                <button
                  title="新建文件夹"
                  className={cn(
                    'transform rounded-lg p-1.5 transition-all duration-300 hover:scale-110',
                    isSelected
                      ? 'text-blue-600 hover:bg-blue-100/50 hover:text-blue-700'
                      : 'text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-blue-400',
                    'shadow-sm hover:shadow-md',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreateNewItem(file.id, 'folder');
                  }}
                >
                  <Icon name="FolderPlus" className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {/* 三个点菜单 */}
            <div className={cn('transform transition-all duration-300 hover:scale-110')}>
              <FileItemMenu
                file={file}
                onShare={onShare}
                onDelete={onDelete}
                onRename={onRename}
                onDuplicate={onDuplicate}
                onDownload={onDownload}
                className={cn(
                  'rounded-lg p-1.5',
                  isSelected
                    ? 'text-blue-600 hover:bg-blue-100/50 hover:text-blue-700'
                    : 'text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-blue-400',
                )}
              />
            </div>
          </div>

          {/* 选中状态的光晕效果 */}
          {isSelected && (
            <div
              className={cn(
                'pointer-events-none absolute inset-0 rounded-lg',
                'bg-blue-500/5 dark:bg-blue-400/8',
              )}
            />
          )}
        </div>

        {/* 如果是展开的文件夹，则递归渲染其子项 */}
        {isFolder && isExpanded && (
          <div className="relative">
            {/* 连接线 */}
            <div
              className={cn(
                'absolute top-0 bottom-0 left-6 w-px',
                'bg-gradient-to-b from-slate-200 via-slate-300 to-transparent',
                'dark:from-slate-600 dark:via-slate-500',
              )}
              style={{ marginLeft: `${depth * 16}px` }}
            />

            <div className="relative">
              {file.children?.map((child) => renderFile(child, depth + 1))}

              {/* 新建项目输入框 */}
              {isAddingNewItem && (
                <div
                  className={cn(
                    'mx-2 my-0.5 flex items-center px-3 py-2 text-sm',
                    'bg-gradient-to-r from-green-50 via-emerald-50/80 to-green-50',
                    'dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20',
                    'rounded-lg border border-green-200/60 dark:border-green-700/50',
                    'shadow-md shadow-green-200/20 dark:shadow-green-800/20',
                  )}
                  style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
                >
                  <div className="mr-2 h-5 w-5 flex-shrink-0"></div>
                  <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center">
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-md',
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
                  <div className="flex flex-1 items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      className={cn(
                        'flex-1 bg-white/90 backdrop-blur-sm dark:bg-slate-700/90',
                        'border-2 border-green-400/70 dark:border-green-500/70',
                        'focus:border-green-500 dark:focus:border-green-400',
                        'focus:ring-2 focus:ring-green-500/30 dark:focus:ring-green-400/30',
                        'rounded-lg px-3 py-2 text-sm transition-all duration-300',
                        'text-slate-900 dark:text-slate-100',
                        'shadow-lg shadow-green-200/30 dark:shadow-green-800/20',
                      )}
                      value={newItemName}
                      onChange={(e) => onSetNewItemName(e.target.value)}
                      onKeyDown={onKeyDown}
                      autoFocus
                      placeholder={`${newItemType === 'folder' ? '文件夹' : '文件'}名称`}
                    />
                    <div className="flex flex-shrink-0 items-center space-x-1">
                      <button
                        className={cn(
                          'transform rounded-xl p-2 transition-all duration-300 hover:scale-110',
                          'bg-gradient-to-br from-green-500 to-emerald-600',
                          'text-white shadow-lg shadow-green-500/30',
                          'hover:from-green-600 hover:to-emerald-700',
                        )}
                        onClick={onFinishCreateNewItem}
                        title="确认"
                      >
                        <Icon name="Check" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={cn(
                          'transform rounded-xl p-2 transition-all duration-300 hover:scale-110',
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
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染顶级新建输入框
  const renderNewRootItem = () => {
    if (newItemFolder !== 'root') return null;

    return (
      <div
        className={cn(
          'mx-2 my-0.5 flex items-center px-3 py-2 text-sm',
          'bg-gradient-to-r from-green-50 via-emerald-50/80 to-green-50',
          'dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20',
          'rounded-lg border border-green-200/60 dark:border-green-700/50',
          'shadow-md shadow-green-200/20 dark:shadow-green-800/20',
        )}
      >
        <div className="mr-2 h-5 w-5 flex-shrink-0"></div>
        <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-md',
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
        <div className="flex flex-1 items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'flex-1 bg-white/90 backdrop-blur-sm dark:bg-slate-700/90',
              'border-2 border-green-400/70 dark:border-green-500/70',
              'focus:border-green-500 dark:focus:border-green-400',
              'focus:ring-2 focus:ring-green-500/30 dark:focus:ring-green-400/30',
              'rounded-lg px-3 py-2 text-sm transition-all duration-300',
              'text-slate-900 dark:text-slate-100',
              'shadow-lg shadow-green-200/30 dark:shadow-green-800/20',
            )}
            value={newItemName}
            onChange={(e) => onSetNewItemName(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            placeholder={`${newItemType === 'folder' ? '文件夹' : '文件'}名称`}
          />
          <div className="flex flex-shrink-0 items-center space-x-1">
            <button
              className={cn(
                'transform rounded-xl p-2 transition-all duration-300 hover:scale-110',
                'bg-gradient-to-br from-green-500 to-emerald-600',
                'text-white shadow-lg shadow-green-500/30',
                'hover:from-green-600 hover:to-emerald-700',
              )}
              onClick={onFinishCreateNewItem}
              title="确认"
            >
              <Icon name="Check" className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn(
                'transform rounded-xl p-2 transition-all duration-300 hover:scale-110',
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
      {files.map((file) => renderFile(file))}
      {renderNewRootItem()}
    </div>
  );
};

export default FileTree;
