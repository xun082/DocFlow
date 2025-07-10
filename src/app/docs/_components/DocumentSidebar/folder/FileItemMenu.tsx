'use client';

import { useState, useRef, useEffect } from 'react';

import { FileItem } from './type';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

interface FileItemMenuProps {
  file: FileItem;
  onShare?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  onRename?: (file: FileItem) => void;
  onDuplicate?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  className?: string;
}

const FileItemMenu = ({
  file,
  onShare,
  onDelete,
  onRename,
  onDuplicate,
  onDownload,
  className,
}: FileItemMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: 'Share2',
      label: '分享',
      action: () => onShare?.(file),
      show: !!onShare,
      className: 'text-blue-600 hover:bg-blue-50',
    },
    {
      icon: 'Download',
      label: '下载',
      action: () => onDownload?.(file),
      show: !!onDownload && file.type === 'file',
      className: 'text-green-600 hover:bg-green-50',
    },
    {
      icon: 'Copy',
      label: '复制',
      action: () => onDuplicate?.(file),
      show: !!onDuplicate,
      className: 'text-gray-600 hover:bg-gray-50',
    },
    {
      icon: 'Pencil',
      label: '重命名',
      action: () => onRename?.(file),
      show: !!onRename,
      className: 'text-gray-600 hover:bg-gray-50',
    },
    {
      icon: 'Trash',
      label: '删除',
      action: () => onDelete?.(file),
      show: !!onDelete,
      className: 'text-red-600 hover:bg-red-50',
      divider: true,
    },
  ].filter((item) => item.show);

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
        onClick={handleMenuClick}
        title="更多操作"
      >
        <Icon name="EllipsisVertical" className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 z-50 bg-white shadow-lg rounded-lg border border-gray-200 py-1 min-w-[140px]"
        >
          {menuItems.map((item, index) => (
            <div key={item.label}>
              {item.divider && index > 0 && <div className="border-t border-gray-200 my-1" />}
              <button
                className={cn(
                  'w-full text-left px-3 py-2 text-sm flex items-center transition-colors',
                  item.className,
                )}
                onClick={() => handleMenuItemClick(item.action)}
              >
                <Icon name={item.icon as any} className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileItemMenu;
