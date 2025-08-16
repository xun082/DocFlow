import { arrayMove } from '@dnd-kit/sortable';

import { FileItem } from '@/app/docs/_components/DocumentSidebar/folder/type';

export function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FileItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number,
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

export function getMaxDepth({ previousItem }: { previousItem: FileItem }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

export function getMinDepth({ nextItem }: { nextItem: FileItem }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

// 扁平所有文件
export function flattenTreeFile(treeFile: FileItem[], partent: string, depth = 0): FileItem[] {
  return treeFile.reduce<FileItem[]>((accmulator, current, index) => {
    if (current.type === 'folder') {
      return [
        ...accmulator,
        { ...current, partentId: partent, depth: depth, order: index },
        ...flattenTreeFile(current.children!, current.id, current.depth + 1),
      ];
    } else {
      return [...accmulator, { ...current, partentId: partent, depth: depth }];
    }
  }, []);
}

// 移除子节点
export function removeChildrenOf(files: FileItem[], ids: string[]) {
  const excludeParentIds = [...ids];

  return files.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children && item.children.length > 0) {
        excludeParentIds.push(item.id);
      }

      return false;
    }

    return true;
  });
}
