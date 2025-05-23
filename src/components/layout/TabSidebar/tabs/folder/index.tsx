'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { FileExplorerProps, FileItem, SearchResultItem } from './type';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import DocumentApi from '@/services/document';
import { DocumentResponse } from '@/services/document/type';

// 默认文件结构，可以根据需求修改
const defaultFiles: FileItem[] = [];

const Folder = ({ initialFiles = defaultFiles, onFileSelect }: FileExplorerProps) => {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
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

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await DocumentApi.GetDocument();

        if (res?.data?.code === 200 && res?.data?.data) {
          const documentResponse = res.data.data as DocumentResponse;
          const apiDocuments = documentResponse.owned || [];

          // 将API返回的文档数据转换为组件需要的格式
          const convertedFiles = processApiDocuments(apiDocuments);
          setFiles(convertedFiles);

          // 如果有文件，默认展开根文件夹
          if (convertedFiles.length > 0) {
            const rootFolders = convertedFiles
              .filter((file) => file.type === 'folder')
              .map((folder) => folder.id);

            const initialExpanded: Record<string, boolean> = {};
            rootFolders.forEach((id) => {
              initialExpanded[id] = true;
            });

            setExpandedFolders(initialExpanded);
          }
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    }

    fetchFiles();
  }, []);

  // 处理API返回的文档数据，将其转换为组件所需的格式
  const processApiDocuments = (documents: DocumentResponse['owned']): FileItem[] => {
    // 创建ID到文档的映射，方便后续处理
    const docMap = new Map<number, DocumentResponse['owned'][0]>();
    documents.forEach((doc) => {
      if (!doc.is_deleted) {
        docMap.set(doc.id, doc);
      }
    });

    // 构建文件树
    const result: FileItem[] = [];
    const childrenMap = new Map<number, FileItem[]>();

    // 先初始化每个文档的children数组
    docMap.forEach((doc) => {
      childrenMap.set(doc.id, []);
    });

    // 将每个文档放入其父文档的children中
    docMap.forEach((doc) => {
      const fileItem: FileItem = {
        id: String(doc.id),
        name: doc.title,
        type: doc.type === 'FOLDER' ? 'folder' : 'file',
        is_starred: doc.is_starred,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };

      if (doc.type === 'FOLDER') {
        fileItem.children = childrenMap.get(doc.id) || [];
      }

      if (doc.parent_id === null) {
        // 根级文档
        result.push(fileItem);
      } else if (docMap.has(doc.parent_id)) {
        // 将文档添加到父文档的children中
        const parentChildren = childrenMap.get(doc.parent_id) || [];
        parentChildren.push(fileItem);
        childrenMap.set(doc.parent_id, parentChildren);
      }
    });

    return result;
  };

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
        <span className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white font-medium">
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

      // 如果是文件类型，导航到文件详情页面
      if (file.type === 'file') {
        router.push(`/docs/${file.id}`);
      }

      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [onFileSelect, router],
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
  const finishCreateNewItem = useCallback(async () => {
    if (!newItemFolder || !newItemType || !newItemName.trim()) {
      setNewItemFolder(null);
      setNewItemType(null);

      return;
    }

    try {
      // 获取父级ID，如果是根目录则为null
      const parentId = newItemFolder === 'root' ? undefined : parseInt(newItemFolder);

      // 调用API创建文档
      const response = await DocumentApi.CreateDocument({
        title: newItemName,
        type: newItemType === 'folder' ? 'FOLDER' : 'FILE',
        parent_id: parentId,
        sort_order: 0,
        is_starred: false,
      });

      // 如果创建成功，刷新文件列表
      if (response?.data?.code === 201) {
        // 重新获取文件列表
        const res = await DocumentApi.GetDocument();

        if (res?.data?.code === 200 && res?.data?.data) {
          const documentResponse = res.data.data as DocumentResponse;
          const apiDocuments = documentResponse.owned || [];
          const convertedFiles = processApiDocuments(apiDocuments);
          setFiles(convertedFiles);

          // 查找新创建的文件或文件夹
          const findNewlyCreatedItem = (items: FileItem[]): FileItem | null => {
            for (const item of items) {
              if (item.name === newItemName) {
                // 如果找到了名称匹配的项，且刚创建的时间比较新，则认为是新创建的
                return item;
              }

              // 递归查找子项
              if (item.children && item.children.length > 0) {
                const found = findNewlyCreatedItem(item.children);
                if (found) return found;
              }
            }

            return null;
          };

          const newItem = findNewlyCreatedItem(convertedFiles);

          if (newItem) {
            // 如果是文件夹，展开它
            if (newItem.type === 'folder') {
              setExpandedFolders((prev) => ({
                ...prev,
                [newItem.id]: true,
              }));
            }

            // 选中新创建的项目
            setSelectedFileId(newItem.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }

    // 清除新建状态
    setNewItemFolder(null);
    setNewItemType(null);
  }, [newItemFolder, newItemType, newItemName, processApiDocuments]);

  // 取消创建新文件/文件夹
  const cancelCreateNewItem = useCallback(() => {
    setNewItemFolder(null);
    setNewItemType(null);
  }, []);

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
          cancelCreateNewItem();
        }
      }
    },
    [isRenaming, finishRenaming, newItemFolder, finishCreateNewItem, cancelCreateNewItem],
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
            'flex items-center py-1.5 px-2 text-sm cursor-pointer hover:bg-gray-100 relative group',
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
          <div className="flex items-center flex-grow overflow-hidden">
            {isFolder ? (
              <Icon
                name={isExpanded ? 'FolderOpen' : 'Folder'}
                className="h-4 w-4 mr-1 flex-shrink-0 text-yellow-500"
              />
            ) : (
              <Icon name="FileText" className="h-4 w-4 mr-1 flex-shrink-0 text-blue-500" />
            )}

            {/* 名称/重命名输入框 */}
            {isItemRenaming ? (
              <input
                ref={inputRef}
                type="text"
                className="bg-white border border-blue-300 px-1 py-0 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
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
          <div className="hidden group-hover:flex items-center ml-2">
            {isFolder && (
              <>
                <button
                  title="新建文件"
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreateNewItem(file.id, 'file');
                  }}
                >
                  <Icon name="FilePlus" className="h-3 w-3" />
                </button>
                <button
                  title="新建文件夹"
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-500 ml-0.5"
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
                className="flex items-center py-1 px-2 text-sm"
                style={{ paddingLeft: `${(depth + 2) * 8}px` }}
              >
                <div className="mr-1 w-4"></div>
                <Icon
                  name={newItemType === 'folder' ? 'Folder' : 'FileText'}
                  className={cn(
                    'h-4 w-4 mr-1',
                    newItemType === 'folder' ? 'text-yellow-500' : 'text-blue-500',
                  )}
                />
                <input
                  ref={inputRef}
                  type="text"
                  className="bg-white border border-blue-300 px-1 py-0 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded mr-2"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex space-x-1">
                  <button
                    className="p-1 rounded-full hover:bg-green-100 text-green-600"
                    onClick={finishCreateNewItem}
                    title="确认"
                  >
                    <Icon name="Check" className="h-3 w-3" />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-red-100 text-red-600"
                    onClick={cancelCreateNewItem}
                    title="取消"
                  >
                    <Icon name="X" className="h-3 w-3" />
                  </button>
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
      <div className="flex items-center py-1 px-2 text-sm">
        <div className="w-4 mr-1"></div>
        <Icon
          name={newItemType === 'folder' ? 'Folder' : 'FileText'}
          className={cn(
            'h-4 w-4 mr-1',
            newItemType === 'folder' ? 'text-yellow-500' : 'text-blue-500',
          )}
        />
        <input
          ref={inputRef}
          type="text"
          className="bg-white border border-blue-300 px-1 py-0 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded mr-2"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex space-x-1">
          <button
            className="p-1 rounded-full hover:bg-green-100 text-green-600"
            onClick={finishCreateNewItem}
            title="确认"
          >
            <Icon name="Check" className="h-3 w-3" />
          </button>
          <button
            className="p-1 rounded-full hover:bg-red-100 text-red-600"
            onClick={cancelCreateNewItem}
            title="取消"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  // 渲染搜索结果下拉框
  const renderSearchDropdown = () => {
    if (!showSearchDropdown) return null;

    return (
      <div className="absolute left-2 right-2 top-[64px] z-10 bg-white shadow-lg rounded-md border border-gray-200 max-h-[50vh] overflow-y-auto">
        <div className="p-2 text-xs text-gray-500 border-b border-gray-200 flex items-center">
          <Icon name="Search" className="h-3 w-3 mr-1" />
          {isSearching ? <span>搜索中...</span> : <span>找到 {searchResults.length} 个结果</span>}
        </div>

        {searchResults.length > 0 ? (
          <div>
            {searchResults.map((result) => (
              <div
                key={result.item.id}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSearchResultClick(result)}
              >
                <Icon
                  name={result.item.type === 'folder' ? 'Folder' : 'FileText'}
                  className={cn(
                    'h-4 w-4 mr-2',
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
            <div className="p-3 text-sm text-gray-500 text-center">未找到匹配的文件或文件夹</div>
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
          className="fixed z-50 bg-white shadow-lg rounded-lg border border-gray-200 py-1 min-w-[160px]"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          {isFolder && (
            <>
              <button
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 hover:text-blue-600 flex items-center"
                onClick={() => startCreateNewItem(targetFile.id, 'file')}
              >
                <Icon name="FilePlus" className="h-4 w-4 mr-2" />
                新建文件
              </button>
              <button
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 hover:text-blue-600 flex items-center"
                onClick={() => startCreateNewItem(targetFile.id, 'folder')}
              >
                <Icon name="FolderPlus" className="h-4 w-4 mr-2" />
                新建文件夹
              </button>
              <div className="border-t border-gray-200 my-1" />
            </>
          )}
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 hover:text-blue-600 flex items-center"
            onClick={() => startRenaming(contextMenuTargetId!)}
          >
            <Icon name="Pencil" className="h-4 w-4 mr-2" />
            重命名
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 hover:text-red-600 flex items-center text-red-500"
            onClick={() => deleteItem(contextMenuTargetId!)}
          >
            <Icon name="Trash" className="h-4 w-4 mr-2" />
            删除
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white border-r border-gray-200">
      {/* 标题栏和工具栏 */}
      <div className="border-b border-gray-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-2">
          <h3 className="text-sm font-medium flex items-center text-gray-700">
            <Icon name="Files" className="h-4 w-4 mr-1 text-blue-600" />
            文档
          </h3>

          <div className="flex space-x-1">
            {/* 工具按钮 */}
            <div className="relative group">
              <button
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors"
                onClick={() => createNewRootItem('file')}
              >
                <Icon name="FilePlus" className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 z-30 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                  新建文件
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors"
                onClick={() => createNewRootItem('folder')}
              >
                <Icon name="FolderPlus" className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 z-30 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                  新建文件夹
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors"
                onClick={() => setFiles([...files])}
              >
                <Icon name="RefreshCw" className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 z-30 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                  刷新
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors"
                onClick={collapseAll}
              >
                <Icon name="FolderMinus" className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 z-30 origin-top-right scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                  折叠所有文件夹
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="px-2 pb-2 relative">
          <div
            className={cn(
              'flex items-center w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5',
              searchFocused && 'ring-2 ring-blue-500 border-blue-500',
            )}
          >
            <Icon name="Search" className="h-3.5 w-3.5 text-gray-400 mr-1" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索文件..."
              className="bg-transparent text-sm w-full focus:outline-none text-gray-700"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchQuery && (
              <button
                className="p-0.5 rounded-full hover:bg-gray-200"
                onClick={clearSearch}
                title="清除搜索"
              >
                <Icon name="X" className="h-3 w-3 text-gray-500" />
              </button>
            )}
            {isSearching && (
              <div className="animate-spin h-3 w-3 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            )}
          </div>
          {renderSearchDropdown()}
        </div>
      </div>

      {/* 文件列表 */}
      <div
        className="flex-1 overflow-y-auto relative"
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

export default Folder;
