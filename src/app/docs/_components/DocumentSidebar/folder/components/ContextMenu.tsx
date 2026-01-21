import React, { useEffect, useRef, useState } from 'react';

import type { FileItem } from '@/types/file-system';
import { cn } from '@/utils';
import { Icon } from '@/components/ui/Icon';

interface ContextMenuProps {
  position: { x: number; y: number } | null;
  targetFile: FileItem | null;
  containerRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onCreateFile: (folderId: string) => void;
  onCreateFolder: (folderId: string) => void;
  onRename: (fileId: string) => void;
}

const CONTAINER_EDGE_OFFSET = 80; // 菜单距离容器边缘的最小间距

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  targetFile,
  containerRef,
  onClose,
  onCreateFile,
  onCreateFolder,
  onRename,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (!position || !menuRef.current) {
      setIsPositioned(false);

      return;
    }

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();

    // 获取容器边界,如果没有容器则使用 viewport
    let containerRect: DOMRect;

    if (containerRef?.current) {
      containerRect = containerRef.current.getBoundingClientRect();
    } else {
      containerRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    }

    let { x, y } = position;

    // 计算鼠标相对于容器的位置
    const spaceOnRight = containerRect.right - x;
    const spaceOnLeft = x - containerRect.left;

    // 智能定位 X 轴:
    // 如果右侧空间足够显示菜单,则显示在右侧(鼠标点击位置)
    // 否则显示在左侧
    if (spaceOnRight >= menuRect.width + CONTAINER_EDGE_OFFSET) {
      // 右侧空间充足,显示在鼠标右侧
      x = x + 10; // 添加小偏移避免遮挡鼠标
    } else if (spaceOnLeft >= menuRect.width + CONTAINER_EDGE_OFFSET) {
      // 右侧空间不足但左侧空间充足,显示在鼠标左侧
      x = x - menuRect.width - 10;
    } else {
      // 左右空间都不足,优先贴右边界
      x = containerRect.right - menuRect.width - CONTAINER_EDGE_OFFSET;
    }

    // 智能定位 Y 轴:
    // 优先显示在鼠标下方,如果下方空间不足则显示在上方
    const spaceBelow = containerRect.bottom - y;
    const spaceAbove = y - containerRect.top;

    if (spaceBelow >= menuRect.height + CONTAINER_EDGE_OFFSET) {
      // 下方空间充足
      y = y + 10;
    } else if (spaceAbove >= menuRect.height + CONTAINER_EDGE_OFFSET) {
      // 下方空间不足但上方空间充足
      y = y - menuRect.height - 10;
    } else {
      // 上下空间都不足,贴底部
      y = containerRect.bottom - menuRect.height - CONTAINER_EDGE_OFFSET;
    }

    // 最终约束确保不超出边界
    const minX = containerRect.left + CONTAINER_EDGE_OFFSET;
    const maxX = containerRect.right - menuRect.width - CONTAINER_EDGE_OFFSET;
    const minY = containerRect.top + CONTAINER_EDGE_OFFSET;
    const maxY = containerRect.bottom - menuRect.height - CONTAINER_EDGE_OFFSET;

    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    setAdjustedPosition({ x, y });
    setIsPositioned(true);
  }, [position, containerRef]);

  if (!position) return null;

  const isFolder = targetFile?.type === 'folder';
  const displayPosition = adjustedPosition || position;

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div
        ref={menuRef}
        className={cn(
          'fixed z-50 min-w-[200px] py-2 rounded-xl',
          'bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg',
          'border border-slate-200/60 dark:border-slate-700/60',
          'shadow-xl shadow-slate-900/10 dark:shadow-slate-900/40',
          'z-9999',
        )}
        style={{
          top: displayPosition.y,
          left: displayPosition.x,
          visibility: isPositioned ? 'visible' : 'hidden',
        }}
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
              onClick={() => onCreateFile(targetFile.id)}
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
              onClick={() => onCreateFolder(targetFile.id)}
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
          onClick={() => onRename(targetFile?.id || '')}
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

export default ContextMenu;
