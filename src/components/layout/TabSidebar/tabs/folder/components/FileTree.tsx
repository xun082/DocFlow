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
  searchQuery: string;
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
  highlightMatch: (
    text: string,
    query: string,
  ) =>
    | { type: 'plain'; content: string }
    | { type: 'highlighted'; parts: { before: string; match: string; after: string } };
}

const FileTree: React.FC<FileTreeProps> = ({
  files,
  expandedFolders,
  selectedFileId,
  isRenaming,
  newItemFolder,
  newItemType,
  newItemName,
  searchQuery,
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
  highlightMatch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 渲染高亮文本的辅助函数
  const renderHighlightedText = (text: string, query: string) => {
    const result = highlightMatch(text, query);

    if (result.type === 'plain') {
      return <span>{result.content}</span>;
    }

    return (
      <>
        {result.parts.before}
        <span className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white font-medium">
          {result.parts.match}
        </span>
        {result.parts.after}
      </>
    );
  };

  // 渲染单个文件或文件夹
  const renderFile = (file: FileItem, depth = 0): React.ReactNode => {
    const isFolder = file.type === 'folder';
    const isExpanded = isFolder && expandedFolders[file.id];
    const isSelected = selectedFileId === file.id;
    const isItemRenaming = isRenaming === file.id;
    const isAddingNewItem = newItemFolder === file.id;

    // 搜索模式下，检查是否匹配搜索条件
    const isMatch = searchQuery && file.name.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={file.id}>
        <div
          className={cn(
            'flex items-center py-1.5 px-2 text-sm cursor-pointer relative group',
            'hover:bg-gray-50 transition-colors duration-150 ease-in-out',
            isSelected && 'bg-blue-100 text-blue-700 border-l-4 border-blue-500 font-medium',
            isMatch && 'bg-yellow-50', // 搜索匹配项背景高亮
          )}
          style={{ paddingLeft: `${(depth + 1) * 8}px` }}
          onClick={(e) => (isFolder ? onToggleFolder(file.id, e) : onFileSelect(file, e))}
          onContextMenu={(e) => onContextMenu(e, file.id)}
        >
          {/* 展开/折叠图标 - 固定宽度 */}
          <div className="mr-1 w-4 h-4 flex-shrink-0 flex items-center justify-center">
            {isFolder ? (
              <div
                className="cursor-pointer w-4 h-4 flex items-center justify-center rounded hover:bg-gray-200 transition-colors duration-150"
                onClick={(e) => onToggleFolder(file.id, e)}
              >
                <Icon
                  name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                  className="h-3 w-3 text-gray-500"
                />
              </div>
            ) : null}
          </div>

          {/* 文件/文件夹图标 - 固定宽度 */}
          <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center">
            {isFolder ? (
              <Icon
                name={isExpanded ? 'FolderOpen' : 'Folder'}
                className="h-4 w-4 text-yellow-500"
              />
            ) : (
              <Icon name="FileText" className="h-4 w-4 text-blue-500" />
            )}
          </div>

          {/* 名称/重命名输入框 - 占用剩余空间 */}
          <div className="flex-1 min-w-0 mr-2">
            {isItemRenaming ? (
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-white border border-blue-300 px-1 py-0 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                defaultValue={file.name}
                onBlur={(e) => onFinishRenaming(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
              />
            ) : (
              <span className="block truncate text-gray-700">
                {searchQuery ? renderHighlightedText(file.name, searchQuery) : file.name}
              </span>
            )}
          </div>

          {/* 快捷操作按钮区域 - 固定宽度，使用 opacity 控制显示 */}
          <div className="flex items-center space-x-0.5 w-auto flex-shrink-0">
            {/* 文件夹快捷操作按钮 */}
            {isFolder && (
              <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                <button
                  title="新建文件"
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreateNewItem(file.id, 'file');
                  }}
                >
                  <Icon name="FilePlus" className="h-3 w-3" />
                </button>
                <button
                  title="新建文件夹"
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreateNewItem(file.id, 'folder');
                  }}
                >
                  <Icon name="FolderPlus" className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* 三个点菜单 - 始终预留空间 */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
              <FileItemMenu
                file={file}
                onShare={onShare}
                onDelete={onDelete}
                onRename={onRename}
                onDuplicate={onDuplicate}
                onDownload={onDownload}
                className=""
              />
            </div>
          </div>
        </div>

        {/* 如果是展开的文件夹，则递归渲染其子项 */}
        {isFolder && isExpanded && (
          <div>
            {file.children?.map((child) => renderFile(child, depth + 1))}

            {/* 新建项目输入框 */}
            {isAddingNewItem && (
              <div
                className="flex items-center py-1.5 px-2 text-sm"
                style={{ paddingLeft: `${(depth + 2) * 8}px` }}
              >
                <div className="w-4 h-4 mr-1 flex-shrink-0"></div>
                <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center">
                  <Icon
                    name={newItemType === 'folder' ? 'Folder' : 'FileText'}
                    className={cn(
                      'h-4 w-4',
                      newItemType === 'folder' ? 'text-yellow-500' : 'text-blue-500',
                    )}
                  />
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-white border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    value={newItemName}
                    onChange={(e) => onSetNewItemName(e.target.value)}
                    onKeyDown={onKeyDown}
                    autoFocus
                  />
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors duration-150"
                      onClick={onFinishCreateNewItem}
                      title="确认"
                    >
                      <Icon name="Check" className="h-3 w-3" />
                    </button>
                    <button
                      className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-150"
                      onClick={onCancelCreateNewItem}
                      title="取消"
                    >
                      <Icon name="X" className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 渲染顶级新建输入框
  const renderNewRootItem = () => {
    if (newItemFolder !== 'root') return null;

    return (
      <div className="flex items-center py-1.5 px-2 text-sm">
        <div className="w-4 h-4 mr-1 flex-shrink-0"></div>
        <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center">
          <Icon
            name={newItemType === 'folder' ? 'Folder' : 'FileText'}
            className={cn(
              'h-4 w-4',
              newItemType === 'folder' ? 'text-yellow-500' : 'text-blue-500',
            )}
          />
        </div>
        <div className="flex-1 flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-white border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            value={newItemName}
            onChange={(e) => onSetNewItemName(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
          />
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors duration-150"
              onClick={onFinishCreateNewItem}
              title="确认"
            >
              <Icon name="Check" className="h-3 w-3" />
            </button>
            <button
              className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-150"
              onClick={onCancelCreateNewItem}
              title="取消"
            >
              <Icon name="X" className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {files.map((file) => renderFile(file))}
      {renderNewRootItem()}
    </div>
  );
};

export default FileTree;
