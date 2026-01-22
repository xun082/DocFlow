'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '@tiptap/react';
import { List } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // 最终是否显示/激活：悬停 或 点击激活 任一为true即可
  const isVisible = isHovered || isActive;
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

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

  // 监听滚动，自动高亮当前可见的标题
  useEffect(() => {
    if (!editor || items.length === 0) return;

    const updateActiveHeading = () => {
      const editorElement = editor.view.dom.parentElement;
      if (!editorElement) return;

      const scrollTop = editorElement.scrollTop;
      const viewportHeight = editorElement.clientHeight;
      const viewportCenter = scrollTop + viewportHeight / 3; // 使用上1/3作为触发点

      // 找到当前视口中心对应的标题
      let currentHeading: TocItem | null = null;

      for (const item of items) {
        const node = editor.view.nodeDOM(item.pos);

        if (node && node instanceof Element) {
          const rect = node.getBoundingClientRect();
          const editorRect = editorElement.getBoundingClientRect();
          const elementTop = rect.top - editorRect.top + scrollTop;

          if (elementTop <= viewportCenter) {
            currentHeading = item;
          } else {
            break;
          }
        }
      }

      if (currentHeading && currentHeading.id !== activeItem) {
        setActiveItem(currentHeading.id);
      }
    };

    const editorElement = editor.view.dom.parentElement;
    if (!editorElement) return;

    editorElement.addEventListener('scroll', updateActiveHeading);
    updateActiveHeading(); // 初始化

    return () => {
      editorElement.removeEventListener('scroll', updateActiveHeading);
    };
  }, [editor, items, activeItem]);

  const scrollToHeading = (pos: number, id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 阻止事件冒泡到父级 div
    editor.commands.focus();
    editor.commands.setTextSelection(pos);
    setActiveItem(id);

    const node = editor.view.nodeDOM(pos);

    if (node && node instanceof Element) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 如果没有标题或未挂载，不渲染任何内容
  if (!mounted || items.length === 0) {
    return null;
  }

  const content = (
    <div
      className="fixed right-6 top-[50%] -translate-y-1/2 z-50 flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 悬浮展开的目录面板 */}
      <div
        className={`
          bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
          rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out
          ${isVisible ? 'w-72 opacity-100' : 'w-0 opacity-0'}
        `}
      >
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          <nav className="space-y-0.5">
            {items.map((item) => {
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={(e) => scrollToHeading(item.pos, item.id, e)}
                  className={`
                    w-full text-left py-1.5 px-2 rounded-md transition-all duration-200 text-sm
                    ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${item.level === 1 ? 'font-semibold' : item.level === 2 ? 'font-medium' : 'font-normal'}
                  `}
                  style={{ paddingLeft: `${8 + (item.level - 1) * 12}px` }}
                >
                  <span className="block truncate">{item.text}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 右侧固定的目录按钮 */}
      <div
        onClick={() => setIsActive(!isActive)}
        className={`
          ml-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
          rounded-lg shadow-lg p-2.5 cursor-pointer transition-all duration-200
          ${isHovered ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
        `}
      >
        <List className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
