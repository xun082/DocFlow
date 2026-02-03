import { DragEndEvent, DragOverEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';

import { getProjection } from '@/utils';
import { useDragDropStore } from '@/stores/dragDropStore';

export const useDragAndDrop = (
  memoFileList: any[],
  expandedFolders: Record<string, boolean>,
  loadFiles: () => Promise<void>,
  toggleFolder: (folderId: string, e: React.MouseEvent) => void,
) => {
  const {
    activeId,
    overId,
    offsetLeft,
    setActiveId,
    setOverId,
    setOffsetLeft,
    resetDragState,
    handleDragEnd: storeDragEnd,
  } = useDragDropStore();

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
    setOverId(e.active.id as string);

    if (e.active.data.current!.isFolder && e.active.data.current!.isExpanded) {
      toggleFolder(e.active.data.current!.id, e.activatorEvent as any);
    }
  };

  const onDragOver = ({ over }: DragOverEvent) => {
    setOverId((over?.id as string) ?? null);
  };

  const onDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) {
      resetDragState();

      return;
    }

    const projected = getProjection(
      memoFileList,
      active.id as string,
      over.id as string,
      expandedFolders,
      offsetLeft,
      16,
    );

    if (projected) {
      await storeDragEnd(active.id as string, over.id as string, projected, loadFiles);
    } else {
      resetDragState();
    }
  };

  return {
    dndState: { activeId, overId, offsetLeft },
    onDragStart,
    onDragOver,
    onDragMove,
    handleDragEnd,
  };
};
