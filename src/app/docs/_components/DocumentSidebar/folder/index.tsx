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
        finishCreateNewItem();
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
          onClick={() => {
            closeContextMenu();
            if (isRenaming) setIsRenaming(null);

            if (newItemFolder) {
              setNewItemFolder(null);
              setNewItemType(null);
            }
          }}
        >
          {/* 如果没有文件数据，只在文件树区域显示骨架屏 */}
          {files.length === 0 ? (
            <LoadingSkeleton />
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
              onClick={fileOperations.confirmDelete}
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
