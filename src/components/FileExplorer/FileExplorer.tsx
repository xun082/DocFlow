'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

// 文件/文件夹类型
type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
};

// 搜索结果项
type SearchResultItem = {
  item: FileItem;
  path: string[];
  ancestors: string[];
};

interface FileExplorerProps {
  initialFiles?: FileItem[];
  onFileSelect?: (file: FileItem) => void;
}

// 默认文件结构，可以根据需求修改
const defaultFiles: FileItem[] = [
  {
    id: '1',
    name: '文档',
    type: 'folder',
    children: [
      { id: '1-1', name: '个人笔记', type: 'file' },
      { id: '1-2', name: '工作计划', type: 'file' },
      { id: '1-3', name: '会议记录', type: 'file' },
    ],
  },
  {
    id: '2',
    name: '项目',
    type: 'folder',
    children: [
      { id: '2-1', name: 'React学习', type: 'file' },
      { id: '2-2', name: 'Next.js笔记', type: 'file' },
      {
        id: '2-3',
        name: 'Tiptap编辑器',
        type: 'folder',
        children: [
          { id: '2-3-1', name: '基础用法', type: 'file' },
          { id: '2-3-2', name: '协作功能', type: 'file' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: '收藏',
    type: 'folder',
    children: [
      { id: '3-1', name: '重要资料', type: 'file' },
      { id: '3-2', name: '待办事项', type: 'file' },
    ],
  },
];

const FileExplorer = ({ initialFiles = defaultFiles, onFileSelect }: FileExplorerProps) => {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '1': true, // 默认展开第一个文件夹
  });
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [contextMenuTargetId, setContextMenuTargetId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newItemFolder, setNewItemFolder] = useState<string | null>(null); // 记录在哪个文件夹下添加新项目
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null); // 记录添加的是文件还是文件夹
  const [newItemName, setNewItemName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 执行搜索
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);

        return;
      }

      setIsSearching(true);

      // 递归搜索文件结构
      const search = (
        items: FileItem[],
        currentPath: string[] = [],
        ancestorIds: string[] = [],
      ): SearchResultItem[] => {
        let results: SearchResultItem[] = [];

        for (const item of items) {
          const lowerCaseName = item.name.toLowerCase();
          const lowerCaseQuery = query.toLowerCase();

          // 检查当前项是否匹配
          if (lowerCaseName.includes(lowerCaseQuery)) {
            results.push({
              item,
              path: [...currentPath, item.name],
              ancestors: [...ancestorIds, item.id],
            });
          }

          // 如果是文件夹，递归搜索子项
          if (item.type === 'folder' && item.children) {
            const childResults = search(
              item.children,
              [...currentPath, item.name],
              [...ancestorIds, item.id],
            );
            results = [...results, ...childResults];
          }
        }

        return results;
      };

      const results = search(files);
      setSearchResults(results);

      // 自动展开包含搜索结果的文件夹
      const foldersToExpand: Record<string, boolean> = {};
      results.forEach((result) => {
        result.ancestors.forEach((id) => {
          foldersToExpand[id] = true;
        });
      });

      setExpandedFolders((prev) => ({
        ...prev,
        ...foldersToExpand,
      }));

      setIsSearching(false);
    },
    [files],
  );

  // 处理搜索输入
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);

      // 防抖：延迟300ms执行搜索，避免输入过程中频繁搜索
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    },
    [performSearch],
  );

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // 当搜索框获得焦点时
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  // 当搜索框失去焦点时
  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);

  // 处理搜索结果点击
  const handleSearchResultClick = useCallback(
    (result: SearchResultItem) => {
      const item = result.item;

      // 如果是文件夹，展开它
      if (item.type === 'folder') {
        setExpandedFolders((prev) => ({
          ...prev,
          [item.id]: true,
        }));
      } else {
        // 如果是文件，选中它
        setSelectedFileId(item.id);

        if (onFileSelect) {
          onFileSelect(item);
        }
      }

      // 清除搜索
      setSearchQuery('');
      setSearchResults([]);
    },
    [onFileSelect],
  );

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 是否显示搜索结果下拉框
  const showSearchDropdown = searchQuery.trim() !== '' && (searchResults.length > 0 || isSearching);

  // 高亮显示匹配的文本
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return <span>{text}</span>;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span className="bg-yellow-200 font-medium text-black dark:bg-yellow-800 dark:text-white">
          {match}
        </span>
        {after}
      </>
    );
  }, []);

  // 处理文件夹展开/折叠
  const toggleFolder = useCallback((folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback(
    (file: FileItem, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFileId(file.id);

      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  // 打开右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTargetId(fileId);
  }, []);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    setContextMenuTargetId(null);
  }, []);

  // 开始重命名
  const startRenaming = useCallback(
    (fileId: string) => {
      setIsRenaming(fileId);
      closeContextMenu();
      // 聚焦到输入框
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    },
    [closeContextMenu],
  );

  // 完成重命名
  const finishRenaming = useCallback(
    (newName: string) => {
      if (!isRenaming) return;

      // 更新文件列表
      const updateFilesRename = (items: FileItem[]): FileItem[] => {
        return items.map((item) => {
          if (item.id === isRenaming) {
            return { ...item, name: newName || item.name };
          }

          if (item.children) {
            return { ...item, children: updateFilesRename(item.children) };
          }

          return item;
        });
      };

      setFiles(updateFilesRename(files));
      setIsRenaming(null);
    },
    [isRenaming, files],
  );

  // 删除文件/文件夹
  const deleteItem = useCallback(
    (fileId: string) => {
      const updateFilesDelete = (items: FileItem[]): FileItem[] => {
        return items.filter((item) => {
          if (item.id === fileId) {
            return false;
          }

          if (item.children) {
            item.children = updateFilesDelete(item.children);
          }

          return true;
        });
      };

      setFiles(updateFilesDelete(files));
      closeContextMenu();
    },
    [files, closeContextMenu],
  );

  // 开始创建新文件/文件夹
  const startCreateNewItem = useCallback(
    (folderId: string, type: 'file' | 'folder') => {
      setNewItemFolder(folderId);
      setNewItemType(type);
      setNewItemName(type === 'file' ? '新文件' : '新文件夹');

      // 如果文件夹未展开，先展开它
      setExpandedFolders((prev) => ({
        ...prev,
        [folderId]: true,
      }));

      closeContextMenu();

      // 聚焦到输入框
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    },
    [closeContextMenu],
  );

  // 完成创建新文件/文件夹
  const finishCreateNewItem = useCallback(() => {
    if (!newItemFolder || !newItemType || !newItemName.trim()) {
      setNewItemFolder(null);
      setNewItemType(null);

      return;
    }

    // 创建新项目ID
    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 定义新项目
    const newItem: FileItem = {
      id: newId,
      name: newItemName,
      type: newItemType,
      ...(newItemType === 'folder' ? { children: [] } : {}),
    };

    // 更新文件列表
    const updateFilesCreate = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.id === newItemFolder) {
          return {
            ...item,
            children: [...(item.children || []), newItem],
          };
        }

        if (item.children) {
          return { ...item, children: updateFilesCreate(item.children) };
        }

        return item;
      });
    };

    // 如果是在根级添加
    if (newItemFolder === 'root') {
      setFiles([...files, newItem]);
    } else {
      setFiles(updateFilesCreate(files));
    }

    // 如果是文件夹，默认展开
    if (newItemType === 'folder') {
      setExpandedFolders((prev) => ({
        ...prev,
        [newId]: true,
      }));
    }

    setNewItemFolder(null);
    setNewItemType(null);

    // 选中新创建的项目
    setSelectedFileId(newId);
  }, [newItemFolder, newItemType, newItemName, files]);

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isRenaming) {
          finishRenaming((e.target as HTMLInputElement).value);
        } else if (newItemFolder) {
          finishCreateNewItem();
        }
      } else if (e.key === 'Escape') {
        if (isRenaming) {
          setIsRenaming(null);
        } else if (newItemFolder) {
          setNewItemFolder(null);
          setNewItemType(null);
        }
      }
    },
    [isRenaming, finishRenaming, newItemFolder, finishCreateNewItem],
  );

  // 折叠所有文件夹
  const collapseAll = useCallback(() => {
    setExpandedFolders({});
  }, []);

  // 在根目录添加新项目
  const createNewRootItem = useCallback(
    (type: 'file' | 'folder') => {
      startCreateNewItem('root', type);
    },
    [startCreateNewItem],
  );

  // 渲染单个文件或文件夹
  const renderFile = (file: FileItem, depth = 0) => {
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
            'group relative flex cursor-pointer items-center px-2 py-1.5 text-sm hover:bg-gray-100',
            isSelected && 'bg-blue-50 text-blue-600',
            isMatch && 'bg-yellow-50', // 搜索匹配项背景高亮
          )}
          style={{ paddingLeft: `${(depth + 1) * 8}px` }}
          onClick={(e) => (isFolder ? toggleFolder(file.id, e) : handleFileSelect(file, e))}
          onContextMenu={(e) => handleContextMenu(e, file.id)}
        >
          {/* 展开/折叠图标 */}
          <div className="mr-1 w-4 flex-shrink-0">
            {isFolder ? (
              <div className="cursor-pointer" onClick={(e) => toggleFolder(file.id, e)}>
                <Icon
                  name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                  className="h-4 w-4 text-gray-500"
                />
              </div>
            ) : (
              <span className="w-4"></span>
            )}
          </div>

          {/* 文件/文件夹图标 */}
          <div className="flex flex-grow items-center overflow-hidden">
            {isFolder ? (
              <Icon
                name={isExpanded ? 'FolderOpen' : 'Folder'}
                className="mr-1 h-4 w-4 flex-shrink-0 text-yellow-500"
              />
            ) : (
              <Icon name="FileText" className="mr-1 h-4 w-4 flex-shrink-0 text-blue-500" />
            )}

            {/* 名称/重命名输入框 */}
            {isItemRenaming ? (
              <input
                ref={inputRef}
                type="text"
                className="w-full rounded border border-blue-300 bg-white px-1 py-0 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                defaultValue={file.name}
                onBlur={(e) => finishRenaming(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <span className="truncate text-gray-700">
                {searchQuery ? highlightMatch(file.name, searchQuery) : file.name}
              </span>
            )}
          </div>

          {/* 快捷操作按钮 (仅在鼠标悬停时显示) */}
          <div className="ml-2 hidden items-center group-hover:flex">
            {isFolder && (
              <>
                <button
                  title="新建文件"
                  className="rounded p-0.5 text-gray-500 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreateNewItem(file.id, 'file');
                  }}
                >
                  <Icon name="FilePlus" className="h-3 w-3" />
                </button>
                <button
                  title="新建文件夹"
                  className="ml-0.5 rounded p-0.5 text-gray-500 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreateNewItem(file.id, 'folder');
                  }}
                >
                  <Icon name="FolderPlus" className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 如果是展开的文件夹，则递归渲染其子项 */}
        {isFolder && isExpanded && (
          <div>
            {file.children?.map((child) => renderFile(child, depth + 1))}

            {/* 新建项目输入框 */}
            {isAddingNewItem && (
              <div
                className="flex items-center px-2 py-1 text-sm"
                style={{ paddingLeft: `${(depth + 2) * 8}px` }}
              >
                <div className="mr-1 w-4"></div>
                <Icon
                  name={newItemType === 'folder' ? 'Folder' : 'FileText'}
                  className={cn(
                    'mr-1 h-4 w-4',
                    newItemType === 'folder' ? 'text-yellow-500' : 'text-blue-500',
                  )}
                />
                <input
                  ref={inputRef}
                  type="text"
                  className="rounded border border-blue-300 bg-white px-1 py-0 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onBlur={finishCreateNewItem}
                  onKeyDown={handleKeyDown}
                />
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
      <div className="flex items-center px-2 py-1 text-sm">
        <div className="mr-1 w-4"></div>
        <Icon
          name={newItemType === 'folder' ? 'Folder' : 'FileText'}
          className={cn(
            'mr-1 h-4 w-4',
            newItemType === 'folder' ? 'text-yellow-500' : 'text-blue-500',
          )}
        />
        <input
          ref={inputRef}
          type="text"
          className="rounded border border-blue-300 bg-white px-1 py-0 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onBlur={finishCreateNewItem}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  };

  // 渲染搜索结果下拉框
  const renderSearchDropdown = () => {
    if (!showSearchDropdown) return null;

    return (
      <div className="absolute top-[64px] right-2 left-2 z-10 max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center border-b border-gray-200 p-2 text-xs text-gray-500">
          <Icon name="Search" className="mr-1 h-3 w-3" />
          {isSearching ? <span>搜索中...</span> : <span>找到 {searchResults.length} 个结果</span>}
        </div>

        {searchResults.length > 0 ? (
          <div>
            {searchResults.map((result) => (
              <div
                key={result.item.id}
                className="flex cursor-pointer items-center p-2 text-sm hover:bg-gray-100"
                onClick={() => handleSearchResultClick(result)}
              >
                <Icon
                  name={result.item.type === 'folder' ? 'Folder' : 'FileText'}
                  className={cn(
                    'mr-2 h-4 w-4',
                    result.item.type === 'folder' ? 'text-yellow-500' : 'text-blue-500',
                  )}
                />
                <div>
                  <div className="text-gray-700">
                    {highlightMatch(result.item.name, searchQuery)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.path.slice(0, -1).join(' > ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isSearching && (
            <div className="p-3 text-center text-sm text-gray-500">未找到匹配的文件或文件夹</div>
          )
        )}
      </div>
    );
  };

  // 右键菜单
  const renderContextMenu = () => {
    if (!contextMenuPosition) return null;

    // 找到目标文件项
    const findTargetFile = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === contextMenuTargetId) {
          return item;
        }

        if (item.children) {
          const found = findTargetFile(item.children);
          if (found) return found;
        }
      }

      return null;
    };

    const targetFile = contextMenuTargetId ? findTargetFile(files) : null;
    const isFolder = targetFile?.type === 'folder';

    return (
      <>
        <div className="fixed inset-0 z-50" onClick={closeContextMenu} />
        <div
          className="fixed z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          {isFolder && (
            <>
              <button
                className="flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-blue-50 hover:text-blue-600"
                onClick={() => startCreateNewItem(targetFile.id, 'file')}
              >
                <Icon name="FilePlus" className="mr-2 h-4 w-4" />
                新建文件
              </button>
              <button
                className="flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-blue-50 hover:text-blue-600"
                onClick={() => startCreateNewItem(targetFile.id, 'folder')}
              >
                <Icon name="FolderPlus" className="mr-2 h-4 w-4" />
                新建文件夹
              </button>
              <div className="my-1 border-t border-gray-200" />
            </>
          )}
          <button
            className="flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-blue-50 hover:text-blue-600"
            onClick={() => startRenaming(contextMenuTargetId!)}
          >
            <Icon name="Pencil" className="mr-2 h-4 w-4" />
            重命名
          </button>
          <button
            className="flex w-full items-center px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => deleteItem(contextMenuTargetId!)}
          >
            <Icon name="Trash" className="mr-2 h-4 w-4" />
            删除
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-gray-200 bg-white">
      {/* 标题栏和工具栏 */}
      <div className="border-b border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-2">
          <h3 className="flex items-center text-sm font-medium text-gray-700">
            <Icon name="Files" className="mr-1 h-4 w-4 text-blue-600" />
            文档
          </h3>

          <div className="flex space-x-1">
            {/* 工具按钮 */}
            <div className="group relative">
              <button
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-500"
                onClick={() => createNewRootItem('file')}
              >
                <Icon name="FilePlus" className="h-4 w-4" />
              </button>
              <div className="absolute top-full right-0 z-30 mt-1 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                  新建文件
                </div>
              </div>
            </div>

            <div className="group relative">
              <button
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-500"
                onClick={() => createNewRootItem('folder')}
              >
                <Icon name="FolderPlus" className="h-4 w-4" />
              </button>
              <div className="absolute top-full right-0 z-30 mt-1 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                  新建文件夹
                </div>
              </div>
            </div>

            <div className="group relative">
              <button
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-500"
                onClick={() => setFiles([...files])}
              >
                <Icon name="RefreshCw" className="h-4 w-4" />
              </button>
              <div className="absolute top-full right-0 z-30 mt-1 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                  刷新
                </div>
              </div>
            </div>

            <div className="group relative">
              <button
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-500"
                onClick={collapseAll}
              >
                <Icon name="FolderMinus" className="h-4 w-4" />
              </button>
              <div className="absolute top-full right-0 z-30 mt-1 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                  折叠所有文件夹
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative px-2 pb-2">
          <div
            className={cn(
              'flex w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5',
              searchFocused && 'border-blue-500 ring-2 ring-blue-500',
            )}
          >
            <Icon name="Search" className="mr-1 h-3.5 w-3.5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索文件..."
              className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchQuery && (
              <button
                className="rounded-full p-0.5 hover:bg-gray-200"
                onClick={clearSearch}
                title="清除搜索"
              >
                <Icon name="X" className="h-3 w-3 text-gray-500" />
              </button>
            )}
            {isSearching && (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
            )}
          </div>
          {renderSearchDropdown()}
        </div>
      </div>

      {/* 文件列表 */}
      <div
        className="relative flex-1 overflow-y-auto"
        onClick={() => {
          // 点击空白区域，取消所有操作状态
          closeContextMenu();

          if (isRenaming) {
            setIsRenaming(null);
          }

          if (newItemFolder) {
            setNewItemFolder(null);
            setNewItemType(null);
          }
        }}
      >
        {files.map((file) => renderFile(file))}
        {renderNewRootItem()}
      </div>

      {/* 右键菜单 */}
      {renderContextMenu()}
    </div>
  );
};

export default FileExplorer;
