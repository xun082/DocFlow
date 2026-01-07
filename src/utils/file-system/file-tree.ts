/**
 * File tree utilities for drag-and-drop and tree operations
 */

import { arrayMove } from '@dnd-kit/sortable';

import type { FileItem } from '@/types/file-system';

/**
 * Calculate drag depth based on offset
 * @param offset - Horizontal offset in pixels
 * @param indentationWidth - Width of one indentation level
 * @returns Calculated depth level
 */
export function getDragDepth(offset: number, indentationWidth: number): number {
  return Math.round(offset / indentationWidth);
}

/**
 * Get the target depth when hovering over a file/folder
 * @param file - Target file item
 * @param isExpand - Whether the folder is expanded
 * @returns Target depth level
 */
export function getOverPath(file: FileItem, isExpand: boolean): number {
  if (file.type === 'folder' && isExpand) {
    return file.depth + 1;
  }

  return file.depth;
}

/**
 * Calculate projection for drag position
 * @param items - All file items
 * @param activeId - ID of dragged item
 * @param overId - ID of hover target
 * @param expandedFolders - Record of expanded folders
 * @param dragOffset - Drag offset in pixels
 * @param indentationWidth - Width of indentation
 * @returns Projection with depth and parent info
 */
export function getProjection(
  items: FileItem[],
  activeId: string,
  overId: string,
  expandedFolders: Record<string, any>,
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

  const maxDepth = getMaxDepth({ previousItem });
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

/**
 * Get maximum allowed depth based on previous item
 * @param previousItem - Previous file item
 * @returns Maximum depth
 */
export function getMaxDepth({ previousItem }: { previousItem: FileItem }): number {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

/**
 * Get minimum allowed depth based on next item
 * @param nextItem - Next file item
 * @returns Minimum depth
 */
export function getMinDepth({ nextItem }: { nextItem: FileItem }): number {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

/**
 * Flatten tree structure into flat array
 * @param treeFile - Tree structure
 * @param parent - Parent ID
 * @param depth - Current depth level
 * @returns Flattened file array
 */
export function flattenTreeFile(
  treeFile: FileItem[],
  parent: string | null = null,
  depth = 0,
): FileItem[] {
  return treeFile.reduce<FileItem[]>((accumulator, current, index) => {
    if (current.type === 'folder') {
      return [
        ...accumulator,
        { ...current, parentId: parent, depth: depth, index: index },
        ...flattenTreeFile(current.children!, current.id, current.depth + 1),
      ];
    } else {
      return [...accumulator, { ...current, parentId: parent, depth: depth }];
    }
  }, []);
}

/**
 * Remove children of specified parent IDs
 * @param files - File array
 * @param ids - Parent IDs to remove children from
 * @returns Filtered file array
 */
export function removeChildrenOf(files: FileItem[], ids: string[]): FileItem[] {
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
 * Build tree structure from flattened items
 * @param flattenedItems - Flattened file array
 * @returns Tree structure
 */
export function buildTree(flattenedItems: FileItem[]): FileItem[] {
  const root: FileItem = {
    id: 'root',
    children: [],
    name: 'root',
    type: 'folder',
    depth: 0,
  };

  const nodes: Record<string, FileItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children, type, name, depth } = item;
    const parentId = item.parentId ?? 'root';
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children, type, name, depth };

    if (parent && parent.type === 'folder') {
      parent.children?.push(item);
    } else {
      root.children?.push(item);
    }
  }

  return root.children!;
}

/**
 * Find item by ID in file array
 * @param items - File array
 * @param itemId - Item ID to find
 * @returns Found file item or undefined
 */
export function findItem(items: FileItem[], itemId: string): FileItem | undefined {
  return items.find(({ id }) => id === itemId);
}
