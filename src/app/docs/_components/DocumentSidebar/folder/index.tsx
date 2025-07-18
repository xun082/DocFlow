'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { FileExplorerProps, FileItem } from './type';
import ShareDialog from './ShareDialog';
import SharedDocuments from './components/SharedDocuments';
import FileTree from './components/FileTree';
import { useFileOperations } from './hooks/useFileOperations';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';
import DocumentApi from '@/services/document';
import { DocumentResponse } from '@/services/document/type';

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
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTargetId(fileId);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    setContextMenuTargetId(null);
  }, []);

  // 重命名
  const startRenaming = useCallback(
    (fileId: string) => {
      setIsRenaming(fileId);
      closeContextMenu();
    },
    [closeContextMenu],
  );

  const finishRenaming = useCallback(
    async (newName: string) => {
      if (!isRenaming || !newName.trim()) {
        setIsRenaming(null);

        return;
      }

      try {
        await fileOperations.handleRename(isRenaming, newName);
        setIsRenaming(null);
      } catch (error) {
        console.error('Failed to rename:', error);
        setIsRenaming(null);
      }
    },
    [isRenaming, fileOperations],
  );

  // 新建文件/文件夹
  const startCreateNewItem = useCallback(
    (folderId: string, type: 'file' | 'folder') => {
      setNewItemFolder(folderId);
      setNewItemType(type);
      setNewItemName('');
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

    const success = await fileOperations.handleCreate(
      newItemName,
      newItemType,
      newItemFolder === 'root' ? undefined : newItemFolder,
    );

    if (success) {
      setNewItemFolder(null);
      setNewItemType(null);
    }
  }, [newItemFolder, newItemType, newItemName, fileOperations]);

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

  const handleRename = useCallback(
    (file: FileItem) => {
      startRenaming(file.id);
    },
    [startRenaming],
  );

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
          className={cn(
            'fixed z-50 min-w-[200px] py-2 rounded-xl',
            'bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg',
            'border border-slate-200/60 dark:border-slate-700/60',
            'shadow-xl shadow-slate-900/10 dark:shadow-slate-900/40',
          )}
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
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
                onClick={() => startCreateNewItem(targetFile.id, 'file')}
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
                onClick={() => startCreateNewItem(targetFile.id, 'folder')}
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
            onClick={() => startRenaming(contextMenuTargetId!)}
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

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* 头部工具栏 - 更精美的设计 */}
      <div
        className={cn(
          'p-4 space-y-4',
          'bg-gradient-to-r from-white/90 via-slate-50/70 to-white/90',
          'dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/90',
          'border-b border-slate-200/60 dark:border-slate-700/60',
          'backdrop-blur-xl',
        )}
      >
        {/* 工具栏按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[
              {
                icon: 'FilePlus',
                action: () => createNewRootItem('file'),
                tooltip: '新建文件',
                color: 'blue',
              },
              {
                icon: 'FolderPlus',
                action: () => createNewRootItem('folder'),
                tooltip: '新建文件夹',
                color: 'yellow',
              },
              { icon: 'RefreshCw', action: refreshFiles, tooltip: '刷新', color: 'green' },
              { icon: 'FolderMinus', action: collapseAll, tooltip: '折叠所有', color: 'slate' },
            ].map((item, index) => (
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

                {/* 精美的提示框 */}
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

      {/* 文件树区域 */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
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
