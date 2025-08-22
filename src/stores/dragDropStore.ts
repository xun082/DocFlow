import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';

import { FileItem } from '@/app/docs/_components/DocumentSidebar/folder/type';
import { flattenTreeFile, buildTree } from '@/utils/file-tree';
import DocumentApi from '@/services/document';

interface DragDropState {
  // 拖拽状态
  activeId: string | null;
  overId: string | null;
  offsetLeft: number;

  // 文件状态
  files: FileItem[];
  expandedFolders: Record<string, boolean>;

  // Actions
  setActiveId: (id: string | null) => void;
  setOverId: (id: string | null) => void;
  setOffsetLeft: (offset: number) => void;
  resetDragState: () => void;

  // 文件操作
  setFiles: (files: FileItem[]) => void;
  setExpandedFolders: (folders: Record<string, boolean>) => void;
  toggleFolder: (folderId: string) => void;

  // 拖拽处理
  handleDragEnd: (
    activeId: string,
    overId: string,
    projected: { depth: number; parentId: string | null | undefined } | null,
    loadFiles: () => Promise<void>,
  ) => Promise<void>;
}

export const useDragDropStore = create<DragDropState>((set, get) => ({
  // 初始状态
  activeId: null,
  overId: null,
  offsetLeft: 0,
  files: [],
  expandedFolders: {},

  // 拖拽状态管理
  setActiveId: (id) => set({ activeId: id }),
  setOverId: (id) => set({ overId: id }),
  setOffsetLeft: (offset) => set({ offsetLeft: offset }),
  resetDragState: () => set({ activeId: null, overId: null, offsetLeft: 0 }),

  // 文件状态管理
  setFiles: (files) => set({ files }),
  setExpandedFolders: (folders) => set({ expandedFolders: folders }),
  toggleFolder: (folderId) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [folderId]: !state.expandedFolders[folderId],
      },
    })),

  // 拖拽结束处理
  handleDragEnd: async (activeId, overId, projected, loadFiles) => {
    const { files, resetDragState, setFiles } = get();

    resetDragState();

    if (!projected) return;

    const { depth, parentId } = projected;
    const clonedItems: FileItem[] = JSON.parse(JSON.stringify(flattenTreeFile(files)));
    const overIndex = clonedItems.findIndex(({ id }) => id === overId);
    const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
    const activeTreeItem = clonedItems[activeIndex];

    clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId: parentId ?? null };

    const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    const newItems = buildTree(sortedItems);

    // 先更新UI状态
    setFiles(newItems);

    // 调用API移动文档
    try {
      const documentIds = [Number(activeId)];
      const targetFolderId = parentId ? Number(parentId) : 0;

      await DocumentApi.MoveDocuments({
        document_ids: documentIds,
        target_folder_id: targetFolderId,
      });

      // API调用成功后刷新文件列表以确保数据同步
      await loadFiles();
    } catch (error) {
      console.error('Failed to move document:', error);
      // 如果API调用失败，恢复原始状态
      setFiles(files);
    }
  },
}));
