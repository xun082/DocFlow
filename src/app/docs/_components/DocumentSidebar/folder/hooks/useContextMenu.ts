import { useState, useCallback } from 'react';

import { FileItem } from '../type';

export const useContextMenu = () => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [contextMenuTargetId, setContextMenuTargetId] = useState<string | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTargetId(fileId);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    setContextMenuTargetId(null);
  }, []);

  const findTargetFile = useCallback(
    (files: FileItem[]): FileItem | null => {
      for (const item of files) {
        if (item.id === contextMenuTargetId) return item;

        if (item.children) {
          const found = findTargetFile(item.children);
          if (found) return found;
        }
      }

      return null;
    },
    [contextMenuTargetId],
  );

  return {
    contextMenuPosition,
    contextMenuTargetId,
    handleContextMenu,
    closeContextMenu,
    findTargetFile,
  };
};
