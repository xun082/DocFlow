'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { FileExplorerProps, FileItem, SearchResultItem } from './type';
import ShareDialog from './ShareDialog';
import SharedDocuments from './components/SharedDocuments';
import FileTree from './components/FileTree';
import { useFileOperations } from './hooks/useFileOperations';
import { useFileSearch } from './hooks/useFileSearch';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import DocumentApi from '@/services/document';
import { DocumentResponse, CreateDocumentDto } from '@/services/document/type';

// 默认文件结构，可以根据需求修改
const defaultFiles: FileItem[] = [];

const Folder = ({ initialFiles = defaultFiles, onFileSelect }: FileExplorerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [contextMenuTargetId, setContextMenuTargetId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newItemFolder, setNewItemFolder] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');

  // 分享对话框状态
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogFile, setShareDialogFile] = useState<FileItem | null>(null);

  // 分享文档展开状态
  const [sharedDocsExpanded, setSharedDocsExpanded] = useState(false);

  // 处理API返回的文档数据，将其转换为组件所需的格式
  const processApiDocuments = useCallback((documents: DocumentResponse['owned']): FileItem[] => {
    const docMap = new Map<number, DocumentResponse['owned'][0]>();
    documents.forEach((doc) => {
      if (!doc.is_deleted) {
        docMap.set(doc.id, doc);
      }
    });

    const result: FileItem[] = [];
    const childrenMap = new Map<number, FileItem[]>();

    docMap.forEach((doc) => {
      childrenMap.set(doc.id, []);
    });

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
        result.push(fileItem);
      } else if (docMap.has(doc.parent_id)) {
        const parentChildren = childrenMap.get(doc.parent_id) || [];
        parentChildren.push(fileItem);
        childrenMap.set(doc.parent_id, parentChildren);
      }
    });

    return result;
  }, []);

  // 加载文件列表
  const loadFiles = useCallback(
    async (isInitialLoad = false) => {
      try {
        const res = await DocumentApi.GetDocument();

        if (res?.data?.code === 200 && res?.data?.data) {
          const documentResponse = res.data.data as DocumentResponse;
          const apiDocuments = documentResponse.owned || [];
          const convertedFiles = processApiDocuments(apiDocuments);
          setFiles(convertedFiles);

          if (!isInitialLoad && selectedFileId) {
            const findFileById = (items: FileItem[], id: string): boolean => {
              for (const item of items) {
                if (item.id === id) return true;
                if (item.children && findFileById(item.children, id)) return true;
              }

              return false;
            };

            if (!findFileById(convertedFiles, selectedFileId)) {
              setSelectedFileId(null);
            }
          }

          if (isInitialLoad && convertedFiles.length > 0) {
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
    },
    [selectedFileId, processApiDocuments],
  );

  const refreshFiles = useCallback(() => loadFiles(false), [loadFiles]);

  useEffect(() => {
    loadFiles(true);
  }, [processApiDocuments]);

  // 使用自定义 hooks
  const fileOperations = useFileOperations(refreshFiles);
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchFocused,
    searchInputRef,
    handleSearchChange,
    clearSearch,
    handleSearchFocus,
    handleSearchBlur,
    highlightMatch,
    showSearchDropdown,
  } = useFileSearch(files, setExpandedFolders);

  // URL选中逻辑
  useEffect(() => {
    if (files.length === 0) return;

    const match = pathname.match(/^\/docs\/(\d+)$/);

    if (match) {
      const fileId = match[1];
      const findFileById = (items: FileItem[], id: string): boolean => {
        for (const item of items) {
          if (item.id === id) return true;
          if (item.children && findFileById(item.children, id)) return true;
        }

        return false;
      };

      if (findFileById(files, fileId)) {
        setSelectedFileId(fileId);
        // 展开包含该文件的父文件夹逻辑...
      }
    } else {
      setSelectedFileId(null);
    }
  }, [pathname, files]);

  // 搜索结果点击
  const handleSearchResultClick = useCallback(
    (result: SearchResultItem) => {
      if (result.item.type === 'folder') {
        setExpandedFolders((prev) => ({ ...prev, [result.item.id]: true }));
      } else {
        setSelectedFileId(result.item.id);
        if (onFileSelect) onFileSelect(result.item);
      }

      clearSearch();
    },
    [onFileSelect, clearSearch],
  );

  // 文件夹操作
  const toggleFolder = useCallback((folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  }, []);

  // 文件选择
  const handleFileSelect = useCallback(
    (file: FileItem, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFileId(file.id);

      if (file.type === 'file') {
        router.push(`/docs/${file.id}`);
      }

      if (onFileSelect) onFileSelect(file);
    },
    [onFileSelect, router],
  );

  // 右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTargetId(fileId);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    setContextMenuTargetId(null);
  }, []);

  // 重命名操作
  const startRenaming = useCallback(
    (fileId: string) => {
      setIsRenaming(fileId);
      closeContextMenu();
    },
    [closeContextMenu],
  );

  const finishRenaming = useCallback(
    async (newName: string) => {
      if (!isRenaming) return;

      try {
        const response = await DocumentApi.RenameDocument({
          document_id: parseInt(isRenaming),
          title: newName || '',
        });

        if (response?.data?.code === 200) {
          await refreshFiles();
          setIsRenaming(null);
          toast.success(`文件已重命名为 "${newName}"`);
        }
      } catch (error) {
        console.error('重命名失败:', error);
        toast.error('重命名失败，请重试');
        setIsRenaming(null);
      }
    },
    [isRenaming, refreshFiles],
  );

  // 创建新项目
  const startCreateNewItem = useCallback(
    (folderId: string, type: 'file' | 'folder') => {
      setNewItemFolder(folderId);
      setNewItemType(type);
      setNewItemName(type === 'file' ? '新文件' : '新文件夹');
      setExpandedFolders((prev) => ({ ...prev, [folderId]: true }));
      closeContextMenu();
    },
    [closeContextMenu],
  );

  const finishCreateNewItem = useCallback(async () => {
    if (!newItemFolder || !newItemType || !newItemName.trim()) {
      setNewItemFolder(null);
      setNewItemType(null);

      return;
    }

    try {
      const createParams: CreateDocumentDto = {
        title: newItemName,
        type: newItemType === 'folder' ? 'FOLDER' : 'FILE',
        sort_order: 0,
        is_starred: false,
      };

      if (newItemFolder !== 'root') {
        createParams.parent_id = parseInt(newItemFolder);
      }

      const response = await DocumentApi.CreateDocument(createParams);

      if (response?.data?.code === 201) {
        setNewItemFolder(null);
        setNewItemType(null);
        await loadFiles();
      }
    } catch (error) {
      console.error('Failed to create document:', error);
      setNewItemFolder(null);
      setNewItemType(null);
    }
  }, [newItemFolder, newItemType, newItemName, loadFiles]);

  const cancelCreateNewItem = useCallback(() => {
    setNewItemFolder(null);
    setNewItemType(null);
  }, []);

  // 键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isRenaming) {
          finishRenaming((e.target as HTMLInputElement).value);
        } else if (newItemFolder) {
          finishCreateNewItem();
        }
      } else if (e.key === 'Escape') {
        if (isRenaming) setIsRenaming(null);
        if (newItemFolder) cancelCreateNewItem();
      }
    },
    [isRenaming, finishRenaming, newItemFolder, finishCreateNewItem, cancelCreateNewItem],
  );

  const collapseAll = useCallback(() => setExpandedFolders({}), []);
  const createNewRootItem = useCallback(
    (type: 'file' | 'folder') => startCreateNewItem('root', type),
    [startCreateNewItem],
  );

  const handleShare = useCallback((file: FileItem) => {
    setShareDialogFile(file);
    setShareDialogOpen(true);
  }, []);

  const handleRename = useCallback((file: FileItem) => startRenaming(file.id), [startRenaming]);

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

  // 渲染搜索下拉框
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
                    {renderHighlightedText(result.item.name, searchQuery)}
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

    const findTargetFile = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.id === contextMenuTargetId) return item;

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
            onClick={() => {
              if (targetFile) fileOperations.handleDelete(targetFile);
            }}
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
        <div className="flex items-center justify-between p-2">
          <h3 className="text-sm font-medium flex items-center text-gray-700">
            <Icon name="Files" className="h-4 w-4 mr-1 text-blue-600" />
            文档
          </h3>

          <div className="flex space-x-1">
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
                onClick={refreshFiles}
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
          closeContextMenu();
          if (isRenaming) setIsRenaming(null);

          if (newItemFolder) {
            setNewItemFolder(null);
            setNewItemType(null);
          }
        }}
      >
        <FileTree
          files={files}
          expandedFolders={expandedFolders}
          selectedFileId={selectedFileId}
          isRenaming={isRenaming}
          newItemFolder={newItemFolder}
          newItemType={newItemType}
          newItemName={newItemName}
          searchQuery={searchQuery}
          onFileSelect={handleFileSelect}
          onToggleFolder={toggleFolder}
          onContextMenu={handleContextMenu}
          onStartCreateNewItem={startCreateNewItem}
          onFinishRenaming={finishRenaming}
          onFinishCreateNewItem={finishCreateNewItem}
          onCancelCreateNewItem={cancelCreateNewItem}
          onKeyDown={handleKeyDown}
          onSetNewItemName={setNewItemName}
          onShare={handleShare}
          onDelete={fileOperations.handleDelete}
          onRename={handleRename}
          onDuplicate={fileOperations.handleDuplicate}
          onDownload={fileOperations.handleDownload}
          highlightMatch={highlightMatch}
        />
      </div>

      {/* 分享文档栏目 */}
      <SharedDocuments
        isExpanded={sharedDocsExpanded}
        onToggle={() => setSharedDocsExpanded(!sharedDocsExpanded)}
      />

      {/* 右键菜单 */}
      {renderContextMenu()}

      {/* 分享对话框 */}
      {shareDialogFile && (
        <ShareDialog
          file={shareDialogFile}
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setShareDialogFile(null);
          }}
        />
      )}
    </div>
  );
};

export default Folder;
