import { arrayMove } from '@dnd-kit/sortable';
import { XmlFragment } from 'yjs';

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

/**
 * 扁平文件夹
 * @param treeFile
 * @param partent
 * @param depth
 * @returns
 */
export function flattenTreeFile(
  treeFile: FileItem[],
  partent: string | null = null,
  depth = 0,
): FileItem[] {
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

/**
 * 移除不需要的子文件
 * @param files
 * @param ids
 * @returns
 */
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

/**
 * 重新生成问价树
 * @param flattenedItems
 * @returns
 */
export function buildTree(flattenedItems: FileItem[]): FileItem[] {
  const root: FileItem = { id: 'root', children: [], name: 'root', type: 'folder', depth: 0 };
  const nodes: Record<string, FileItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));
  console.log(items);

  for (const item of items) {
    const { id, children, type, name, depth } = item;
    const parentId = item.parentId ?? 'root';

    const parent = nodes[parentId] ?? findItem(items, parentId);
    console.log('parentId parent', parentId, parent);

    nodes[id] = { id, children, type, name, depth };

    /**
     * 解决吞文件问题
     */
    if (parent && parent.type === 'folder') {
      console.log('first');
      parent.children?.push(item);
    } else {
      root.children?.push(item);
    }
  }

  return root.children!;
}

/**
 * 文件搜索
 * @param items
 * @param itemId
 * @returns
 */
export function findItem(items: FileItem[], itemId: string) {
  return items.find(({ id }) => id === itemId);
}
