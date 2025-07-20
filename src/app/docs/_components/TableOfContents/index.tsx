'use client';

import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';

import { Icon } from '@/components/ui/Icon';

interface TocItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

interface TableOfContentsProps {
  editor: Editor;
  onClose?: () => void;
  isOpen?: boolean;
}

export function TableOfContents({ editor, onClose, isOpen = true }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateToc = () => {
      const headings: TocItem[] = [];
      const doc = editor.state.doc;

      doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const id = `heading-${pos}`;
          headings.push({
            id,
            level: node.attrs.level,
            text: node.textContent || '无标题',
            pos,
          });
        }
      });

      setItems(headings);
    };

    // 初始化
    updateToc();

    // 使用editor的transaction事件监听文档变化
    const handleTransaction = () => {
      updateToc();
    };

    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  const scrollToHeading = (pos: number) => {
    editor.commands.focus();
    editor.commands.setTextSelection(pos);

    // 滚动到可视区域
    const node = editor.view.nodeDOM(pos);

    if (node && node instanceof Element) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">目录</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 目录列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            没有找到标题
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToHeading(item.pos)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  style={{ paddingLeft: `${8 + (item.level - 1) * 16}px` }}
                >
                  <span className="truncate block">{item.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
