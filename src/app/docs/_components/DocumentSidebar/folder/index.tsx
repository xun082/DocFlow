'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { closestCenter, DndContext, MeasuringStrategy, PointerSensor } from '@dnd-kit/core';
import { useSensor, useSensors } from '@dnd-kit/core';

import { FileExplorerProps, FileItem } from './type';
import ShareDialog from './ShareDialog';
import SharedDocuments from './components/SharedDocuments';
import FileTree from './components/FileTree';
import Toolbar from './components/Toolbar';
import ContextMenu from './components/ContextMenu';
import { useFileOperations } from './hooks/useFileOperations';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useContextMenu } from './hooks/useContextMenu';

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

  const memoFileList = useMemo(() => {
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
  }, [files, expandedFolders]);

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
      {/* 头部工具栏 */}
      <Toolbar
        onCreateFile={() => createNewRootItem('file')}
        onCreateFolder={() => createNewRootItem('folder')}
        onRefresh={refreshFiles}
        onCollapseAll={collapseAll}
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
    </div>
  );
};

export default Folder;
