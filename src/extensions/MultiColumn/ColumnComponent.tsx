import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';

export default function ColumnComponent(props: ReactNodeViewProps<HTMLDivElement>) {
  const { position, backgroundColor } = props.node.attrs;

  const [width, setWidth] = useState('100%');
  const columnRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const diff = e.clientX - startX.current;
      const newWidth = `${startWidth.current + diff}px`;

      setWidth(newWidth);

      // 更新节点属性
      if (props.editor) {
        props.editor.commands.updateAttributes('column', { width: newWidth });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, props]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = columnRef.current?.offsetWidth || 0;
  };

  return (
    <NodeViewWrapper className="column-wrapper" style={{ width }}>
      <div
        ref={columnRef}
        data-type="column"
        data-position={position}
        data-background-color={backgroundColor}
        className="p-3 rounded relative"
        style={{ backgroundColor: backgroundColor }}
      >
        <NodeViewContent className="column-content" />
        {/* 右侧边框拖拽区域 */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-ew-resize z-10"
          style={{ backgroundColor: 'transparent' }}
          onMouseDown={handleMouseDown}
        />
      </div>
    </NodeViewWrapper>
  );
}
