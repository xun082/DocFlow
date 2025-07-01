import { useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import { TableOfContentsStorage } from '@tiptap/extension-table-of-contents';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/utils';

type TableOfContentsProps = {
  editor: Editor;
  isOpen?: boolean;
  onClose?: () => void;
};

export const TableOfContents = ({
  editor,
  isOpen = true,
  onClose = () => {},
}: TableOfContentsProps) => {
  const content = useEditorState({
    editor,
    selector: (ctx) => {
      return (ctx.editor.storage.tableOfContents as TableOfContentsStorage).content;
    },
    equalityFn: (a, b) => a === b,
  });

  const handleItemClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  }, [onClose]);

  // 获取标题层级的缩进和样式
  const getHeadingStyles = (level: number, isActive: boolean) => {
    // 基本样式
    return {
      container: cn(
        'group flex items-center w-full py-2 px-3 my-1 rounded-lg transition-all duration-200 relative',
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-transparent text-blue-600 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-blue-500 before:rounded-r'
          : 'hover:bg-neutral-50',
      ),
      text: cn(
        'text-ellipsis overflow-hidden whitespace-nowrap max-w-full',
        level === 1 ? 'font-semibold' : '',
        level === 2 ? 'font-medium' : '',
        level > 2 ? 'text-sm text-neutral-600' : 'text-neutral-800',
        isActive ? '!text-blue-600' : '',
      ),
    };
  };

  return (
    <div
      className={cn(
        'h-full bg-white border-l border-neutral-200 transition-all duration-300 ease-in-out overflow-hidden',
        isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0',
      )}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
              <Icon name="BookOpen" className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-lg font-medium text-neutral-800">目录</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
          {content.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-6">
              <Icon name="FileText" className="w-12 h-12 text-neutral-200 mb-4" />
              <p className="text-sm">添加标题创建目录</p>
              <p className="text-xs text-neutral-300 mt-1">使用#、##或###创建标题</p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {content.map((item) => {
                const styles = getHeadingStyles(item.level, item.isActive);

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={handleItemClick}
                    className={styles.container}
                    style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                    title={item.textContent}
                  >
                    <span className={styles.text}>{item.textContent}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
