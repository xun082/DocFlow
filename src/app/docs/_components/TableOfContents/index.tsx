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
  isOpen?: boolean;
}

export function TableOfContents({ editor, isOpen = true }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);

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

    updateToc();

    const handleTransaction = () => {
      updateToc();
    };

    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  const scrollToHeading = (pos: number, id: string) => {
    editor.commands.focus();
    editor.commands.setTextSelection(pos);
    setActiveItem(id);

    const node = editor.view.nodeDOM(pos);

    if (node && node instanceof Element) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-950">
      {/* 简洁的目录列表 */}
      <div className="clean-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Icon name="List" className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">暂无目录</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">添加标题来生成目录</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const paddingLeft = 12 + (item.level - 1) * 16;

              return (
                <div key={item.id} className="relative">
                  {/* 层级连接线 */}
                  {item.level > 1 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
                      style={{ left: `${paddingLeft - 8}px` }}
                    />
                  )}

                  <button
                    onClick={() => scrollToHeading(item.pos, item.id)}
                    className={`group relative w-full rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900/50'
                    } `}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                  >
                    {/* 活动指示器 */}
                    {isActive && (
                      <div className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 transform rounded-r-sm bg-blue-500" />
                    )}

                    <div className="flex items-center py-2.5 pr-3">
                      {/* 简洁图标 */}
                      <div className="mr-3 flex-shrink-0">
                        {item.level === 1 && (
                          <div
                            className={`h-2 w-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-400'}`}
                          />
                        )}
                        {item.level === 2 && (
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-gray-300'}`}
                          />
                        )}
                        {item.level >= 3 && (
                          <div
                            className={`h-1 w-1 rounded-full ${isActive ? 'bg-blue-300' : 'bg-gray-300'}`}
                          />
                        )}
                      </div>

                      {/* 标题文本 */}
                      <span
                        className={`flex-1 truncate text-sm leading-relaxed ${item.level === 1 ? 'font-semibold' : item.level === 2 ? 'font-medium' : 'font-normal'} `}
                      >
                        {item.text}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 简洁的底部统计 */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>共 {items.length} 个标题</span>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((level) => {
                const count = items.filter((item) => item.level === level).length;

                return count > 0 ? (
                  <span key={level} className="flex items-center space-x-1">
                    <span>H{level}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {count}
                    </span>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .clean-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .clean-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .clean-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 2px;
        }
        .clean-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        .dark .clean-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.3);
        }
        .dark .clean-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.5);
        }
      `}</style>
    </div>
  );
}
