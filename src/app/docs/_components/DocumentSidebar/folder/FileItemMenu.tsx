'use client';

import { useState, useRef, useEffect } from 'react';

import { FileItem } from './type';

import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  // 简单的PDF导出功能
  const handleExportPDF = async () => {
    try {
      // 获取编辑器内容 - 尝试多个可能的选择器
      const editorSelectors = [
        '.prose-container .ProseMirror',
        '.ProseMirror',
        '[contenteditable="true"]',
        '.editor',
        '#editor',
      ];

      let editorElement: HTMLElement | null = null;

      for (const selector of editorSelectors) {
        editorElement = document.querySelector(selector) as HTMLElement;
        if (editorElement) break;
      }

      if (!editorElement) {
        throw new Error('找不到编辑器内容，请确保页面有可编辑的文档内容');
      }

      const title = file.name || '文档';

      try {
        // 动态导入 html2pdf
        const html2pdf = (await import('html2pdf.js')).default;

        // 简单的PDF配置
        const options = {
          filename: `${title}_${new Date().toISOString().split('T')[0]}.pdf`,
          margin: 10,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        };

        // 生成并保存PDF
        await html2pdf().set(options).from(editorElement).save();

        toast({
          title: '导出成功',
          description: `PDF文档 "${title}.pdf" 已下载`,
        });
      } catch (pdfError) {
        console.error('PDF生成失败:', pdfError);
        toast({
          title: '导出失败',
          description: 'PDF生成失败，请重试',
          variant: 'destructive',
        });
      } finally {
        // 清理临时元素
      }
    } catch (error) {
      console.error('导出PDF失败:', error);
      toast({
        title: '导出失败',
        description: '无法获取文档内容',
        variant: 'destructive',
      });
    }
  };

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
      icon: 'FileText',
      label: '导出PDF',
      action: () => handleExportPDF(),
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
