import { Node } from '@tiptap/pm/model';
import { Editor, NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react';
import { useCallback } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';

import { cn } from '@/utils';

import 'react-photo-view/dist/react-photo-view.css';

interface TableImageViewProps extends ReactNodeViewProps {
  editor: Editor;
  getPos: () => number | undefined;
  node: Node;
  updateAttributes: (attrs: Record<string, any>) => void;
}

export const TableImageView = (props: TableImageViewProps) => {
  const { editor, getPos, node } = props;
  const { src, alt } = node.attrs;

  const onNodeSelection = useCallback(() => {
    const pos = getPos();

    if (pos !== undefined) {
      editor.commands.setNodeSelection(pos);
    }
  }, [getPos, editor.commands]);

  return (
    <>
      <NodeViewWrapper>
        <div className="relative inline-block" data-drag-handle>
          <div contentEditable={false}>
            <PhotoProvider>
              <PhotoView src={src}>
                <img
                  className={cn(
                    // 基础样式
                    'max-w-[120px] max-h-[80px] min-w-[60px] min-h-[40px]',
                    'object-cover rounded-md select-none',
                    // 边框和状态
                    'border border-gray-200 dark:border-gray-600',
                    // 悬浮效果
                    'transition-all duration-200 ease-in-out',
                    'hover:opacity-80 hover:scale-[1.02] hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20',
                    // 激活效果
                    'active:scale-[0.98]',
                    // 响应式调整
                    'sm:max-w-[120px] sm:max-h-[80px] max-sm:max-w-[80px] max-sm:max-h-[60px]',
                    // 表格中居中
                    'block mx-auto my-1',
                  )}
                  src={src}
                  alt={alt || ''}
                  onMouseDown={onNodeSelection}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  data-table-image="true"
                  style={
                    {
                      userDrag: 'none' as any,
                      WebkitUserDrag: 'none' as any,
                    } as React.CSSProperties
                  }
                />
              </PhotoView>
            </PhotoProvider>
          </div>
        </div>
      </NodeViewWrapper>
    </>
  );
};

export default TableImageView;
