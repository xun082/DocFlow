import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';

export default function ColumnComponent(props: ReactNodeViewProps<HTMLDivElement>) {
  const { position, backgroundColor, draggable, order } = props.node.attrs;

  const [width, setWidth] = useState('100%');
  const columnRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const diff = e.clientX - startX.current;
      const newWidth =
        position === 'left' ? `${startWidth.current + diff}px` : `${startWidth.current + diff}px`;

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
  }, [isResizing, position, props]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = columnRef.current?.offsetWidth || 0;
  };

  // 拖拽事件处理
  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) {
      e.preventDefault();

      return;
    }

    setIsDragging(true);
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        nodeType: 'column',
        position: position,
        order: order,
      }),
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));

      if (dragData.nodeType === 'column' && dragData.position !== position) {
        const pos = props.getPos();

        if (pos !== undefined) {
          // 调用交换列的命令 - 暂时注释掉，等待在Columns.ts中实现
          // props.editor.commands.swapColumns(dragData.position, position);
        }
      }
    } catch (error) {
      console.error('拖拽数据解析失败:', error);
    }
  };

  return (
    <NodeViewWrapper className="column-wrapper" style={{ width }}>
      <div
        ref={columnRef}
        data-type="column"
        data-position={position}
        data-background-color={backgroundColor}
        className={`p-3 rounded relative ${isDragging ? 'opacity-50' : ''} ${dragOver ? 'border-2 border-blue-500' : ''}`}
        style={{ backgroundColor: backgroundColor }}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
