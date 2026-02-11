'use client';

import { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { List, X } from 'lucide-react';

interface TocItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

interface FloatingTocProps {
  editor: Editor;
}

export function FloatingToc({ editor }: FloatingTocProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // 提取文档中的标题
  useEffect(() => {
    if (!editor) return;

    const updateToc = () => {
      const headings: TocItem[] = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          headings.push({
            id: `heading-${pos}`,
            level: node.attrs.level,
            text: node.textContent,
            pos,
          });
        }
      });

      setItems(headings);
    };

    updateToc();
    editor.on('transaction', updateToc);

    return () => {
      editor.off('transaction', updateToc);
    };
  }, [editor]);

  // 滚动时自动高亮当前可见标题（使用 rAF 节流）
  useEffect(() => {
    if (!editor || items.length === 0) return;

    const editorElement = editor.view.dom.parentElement;
    if (!editorElement) return;

    const updateActiveHeading = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = editorElement.scrollTop;
        const triggerPoint = scrollTop + editorElement.clientHeight / 3;

        let current: TocItem | null = null;

        for (const item of items) {
          const node = editor.view.nodeDOM(item.pos);

          if (node instanceof Element) {
            const editorRect = editorElement.getBoundingClientRect();
            const rect = node.getBoundingClientRect();
            const elementTop = rect.top - editorRect.top + scrollTop;

            if (elementTop <= triggerPoint) {
              current = item;
            } else {
              break;
            }
          }
        }

        if (current) {
          setActiveId(current.id);
        }
      });
    };

    editorElement.addEventListener('scroll', updateActiveHeading, { passive: true });
    updateActiveHeading();

    return () => {
      editorElement.removeEventListener('scroll', updateActiveHeading);
      cancelAnimationFrame(rafRef.current);
    };
  }, [editor, items]);

  // 点击外部时关闭目录面板
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const scrollToHeading = (pos: number, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    editor.commands.focus();
    editor.commands.setTextSelection(pos);
    setActiveId(id);

    const node = editor.view.nodeDOM(pos);

    if (node instanceof Element) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center"
    >
      {/* 展开的目录面板 */}
      <div
        className={`
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
          border border-gray-200 dark:border-gray-700
          rounded-xl shadow-2xl overflow-hidden
          transition-all duration-300 ease-in-out origin-right
          ${isOpen ? 'w-64 opacity-100 scale-x-100' : 'w-0 opacity-0 scale-x-0'}
        `}
      >
        <div className="p-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              目录
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <nav className="space-y-0.5">
            {items.map((item) => {
              const isItemActive = activeId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={(e) => scrollToHeading(item.pos, item.id, e)}
                  className={`
                    w-full text-left py-1.5 px-2 rounded-lg transition-all duration-150 text-[13px] leading-snug
                    ${
                      isItemActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                    ${item.level === 1 ? 'font-semibold text-sm' : ''}
                  `}
                  style={{ paddingLeft: `${8 + (item.level - 1) * 14}px` }}
                >
                  <span className="block truncate">{item.text}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 目录切换按钮 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          ml-1.5 flex items-center justify-center w-8 h-8
          rounded-lg shadow-md border transition-all duration-200
          ${
            isOpen
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
              : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
          }
        `}
        title="文档目录"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
