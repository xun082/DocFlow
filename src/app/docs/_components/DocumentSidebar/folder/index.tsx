'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { closestCenter, DndContext, MeasuringStrategy, PointerSensor } from '@dnd-kit/core';
import { useSensor, useSensors } from '@dnd-kit/core';

import { FileExplorerProps, FileItem } from './type';
import ShareDialog from './ShareDialog';
import SharedDocuments from './components/SharedDocuments';
import FileTree from './components/FileTree';
import Toolbar from './components/Toolbar';
import ContextMenu from './components/ContextMenu';
import LoadingSkeleton from './components/LoadingSkeleton';
import { useFileOperations } from './hooks/useFileOperations';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useContextMenu } from './hooks/useContextMenu';

import { useSidebar } from '@/stores/sidebarStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useFileStore } from '@/stores/fileStore';
import { flattenTreeFile, getProjection, removeChildrenOf } from '@/utils/file-tree';

export const TRASH_ID = 'void';

const Folder = ({ onFileSelect }: FileExplorerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { refreshTrigger, lastOperationSource, triggerRefresh } = useSidebar();

  // 使用 Zustand stores
  const {
    files,
    expandedFolders,
    selectedFileId,
    isRenaming,
    newItemFolder,
    newItemType,
    newItemName,
    shareDialogOpen,
    shareDialogFile,
    sharedDocsExpanded,
    isLoading,
    setSelectedFileId,
    setIsRenaming,
    setNewItemFolder,
    setNewItemType,
    setNewItemName,
    setShareDialogOpen,
    setShareDialogFile,
    setSharedDocsExpanded,
    toggleFolder: storeToggleFolder,
    collapseAll,
    loadFiles,
    finishCreateNewItem,
    cancelCreateNewItem,
  } = useFileStore();

  // 文件夹操作
  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storeToggleFolder(folderId);
  };

  // 使用自定义 hooks
  const refreshFiles = () => loadFiles(false);
  const fileOperations = useFileOperations(refreshFiles);
  const {
    contextMenuPosition,
    contextMenuTargetId,
    handleContextMenu,
    closeContextMenu,
    findTargetFile,
  } = useContextMenu();

  const memoFileList = (() => {
    const flattenFile = flattenTreeFile(files);
    const expandedFiles = flattenFile.reduce<string[]>((acc, item) => {
      if (!expandedFolders[item.id] && item.children && item.children.length > 0) {
        return [...acc, item.id];
      } else {
        return [...acc];
      }
    }, []);

    const items = removeChildrenOf(flattenFile, expandedFiles);

    return items;
  })();

  // 使用拖拽钩子
  const { dndState, onDragStart, onDragOver, onDragMove, handleDragEnd } = useDragAndDrop(
    memoFileList,
    expandedFolders,
    loadFiles,
    toggleFolder,
  );

  useEffect(() => {
    loadFiles(true);
  }, [loadFiles]);

  // 监听 refreshTrigger 变化，当从外部触发刷新时重新加载文件列表
  useEffect(() => {
    if (refreshTrigger > 0 && lastOperationSource !== 'side') {
      loadFiles(true);
    }
  }, [refreshTrigger, lastOperationSource, loadFiles]);

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
      }
    } else {
      setSelectedFileId(null);
    }
  }, [pathname, files, setSelectedFileId]);

  // 文件选择
  const handleFileSelect = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileId(file.id);

    if (file.type === 'file') {
      router.push(`/docs/${file.id}`);
    }

    if (onFileSelect) onFileSelect(file);
  };

  // 重命名
  const startRenaming = (fileId: string) => {
    setIsRenaming(fileId);
    closeContextMenu();
  };

  const finishRenaming = async (newName: string) => {
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
  };

  // 新建文件/文件夹
  const startCreateNewItem = (folderId: string, type: 'file' | 'folder') => {
    setNewItemFolder(folderId);
    setNewItemType(type);
    setNewItemName('');
    closeContextMenu();
  };

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isRenaming) {
        finishRenaming((e.target as HTMLInputElement).value);
      } else if (newItemFolder) {
        finishCreateNewItem().then(() => triggerRefresh('side'));
      }
    } else if (e.key === 'Escape') {
      if (isRenaming) setIsRenaming(null);
      if (newItemFolder) cancelCreateNewItem();
    }
  };

  // root下面创建新文件
  const createNewRootItem = (type: 'file' | 'folder') => startCreateNewItem('root', type);

  const handleShare = (file: FileItem) => {
    setShareDialogFile(file);
    setShareDialogOpen(true);
  };

  const handleRename = (file: FileItem) => {
    startRenaming(file.id);
  };

  const sensor = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const projected =
    dndState.activeId && dndState.overId
      ? getProjection(
          memoFileList,
          dndState.activeId,
          dndState.overId,
          expandedFolders,
          dndState.offsetLeft,
          16,
        )
      : null;

  const targetFile = contextMenuTargetId ? findTargetFile(files) : null;

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* 头部工具栏 - 始终显示 */}
      <Toolbar
        onCreateFile={() => createNewRootItem('file')}
        onCreateFolder={() => createNewRootItem('folder')}
        onRefresh={refreshFiles}
        onCollapseAll={collapseAll}
        isLoading={isLoading}
      />

      {/* 拖拽上下文 */}
      <DndContext
        sensors={sensor}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={handleDragEnd}
        onDragMove={onDragMove}
      >
        {/* 文件树区域 */}
        <div
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent relative"
          onClick={(e) => {
            // 检查点击的是否是新建输入框区域
            const target = e.target as HTMLElement;
            const isNewItemInput = target.closest('[data-new-item-container]');

            if (!isNewItemInput) {
              closeContextMenu();
              if (isRenaming) setIsRenaming(null);

              if (newItemFolder) {
                setNewItemFolder(null);
                setNewItemType(null);
              }
            }
          }}
        >
          {/* 根据加载状态和文件数量显示不同内容 */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : files.length === 0 && !newItemFolder && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                暂无文档
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-48">
                点击上方的新建按钮创建您的第一个文档
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => createNewRootItem('file')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  新建文档
                </button>
                <button
                  onClick={() => createNewRootItem('folder')}
                  className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                  新建文件夹
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 加载指示器 */}
              {isLoading && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center space-x-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-slate-200/50 dark:border-slate-600/50">
                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">刷新中...</span>
                  </div>
                </div>
              )}

              <FileTree
                files={memoFileList}
                projected={projected}
                expandedFolders={expandedFolders}
                selectedFileId={selectedFileId}
                dndState={dndState}
                isRenaming={isRenaming}
                newItemFolder={newItemFolder}
                newItemType={newItemType}
                newItemName={newItemName}
                onFileSelect={handleFileSelect}
                onToggleFolder={toggleFolder}
                onContextMenu={handleContextMenu}
                onStartCreateNewItem={startCreateNewItem}
                onFinishRenaming={finishRenaming}
                onFinishCreateNewItem={() =>
                  finishCreateNewItem().then(() => triggerRefresh('side'))
                }
                onCancelCreateNewItem={cancelCreateNewItem}
                onKeyDown={handleKeyDown}
                onSetNewItemName={setNewItemName}
                onShare={handleShare}
                onDelete={fileOperations.handleDelete}
                onRename={handleRename}
                onDuplicate={fileOperations.handleDuplicate}
                onDownload={fileOperations.handleDownload}
                onExportDOCX={fileOperations.handleExportDOCX}
              />
            </>
          )}
        </div>
      </DndContext>

      {/* 分享文档栏目 */}
      <SharedDocuments
        isExpanded={sharedDocsExpanded}
        onToggle={() => setSharedDocsExpanded(!sharedDocsExpanded)}
      />

      {/* 右键菜单 */}
      <ContextMenu
        position={contextMenuPosition}
        targetFile={targetFile}
        onClose={closeContextMenu}
        onCreateFile={(folderId) => startCreateNewItem(folderId, 'file')}
        onCreateFolder={(folderId) => startCreateNewItem(folderId, 'folder')}
        onRename={(fileId) => startRenaming(fileId)}
      />

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

      {/* 删除确认对话框 */}
      <Dialog open={fileOperations.showDeleteDialog} onOpenChange={fileOperations.cancelDelete}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-lg transition-all">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center space-x-2 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-bounce"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>确认删除</span>
            </DialogTitle>
            <DialogDescription className="mt-3 text-slate-600">
              您确定要删除{' '}
              <span className="font-medium text-slate-900">
                "{fileOperations.fileToDelete?.name}"
              </span>{' '}
              吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-6 pt-4 bg-slate-50/50 border-t border-slate-200/50 flex space-x-3">
            <Button
              variant="outline"
              onClick={fileOperations.cancelDelete}
              className="flex-1 bg-transparent hover:bg-slate-100 transition-colors"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => fileOperations.confirmDelete().then(() => triggerRefresh('side'))}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Folder;
