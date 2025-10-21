import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorState } from '@tiptap/react';
import { v4 as uuid } from 'uuid';

import { ColumnLayout } from './Columns';
import { dragHandlerDirect } from './helpers/dragHandler';

import { ColorPicker } from '@/components/panels/Colorpicker/Colorpicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';

// 默认背景色
const DEFAULT_BACKGROUND_COLOR = '#f3f4f6';

export default function ColumnComponent(props: ReactNodeViewProps<HTMLDivElement>) {
  const { editor, node, updateAttributes } = props;
  const { position, backgroundColor = DEFAULT_BACKGROUND_COLOR } = node.attrs;

  // 状态管理
  const [width, setWidth] = useState('100%');
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(backgroundColor);
  const [showToolbar, setShowToolbar] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const columnKey = uuid();

  // refs
  const columnRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // 获取父节点（columns）
  const getParentNode = useCallback(() => {
    const pos = props.getPos();
    if (typeof pos !== 'number') return null;

    const resolvedPos = editor.state.doc.resolve(pos);
    const parentNode = resolvedPos.parent;

    if (parentNode?.type.name === 'columns') {
      return parentNode;
    }

    return null;
  }, [editor, props]);

  // 获取 columns 的子元素数量
  const getColumnsCount = useCallback(() => {
    const parentNode = getParentNode();
    if (!parentNode) return 0;

    return parentNode.childCount;
  }, [getParentNode]);

  // 判断是否可以拖拽（子元素数量大于2时允许拖拽）
  const isDraggable = useCallback(() => {
    const count = getColumnsCount();

    return count > 2;
  }, [getColumnsCount]);

  // 获取父节点位置
  const getParentPosition = useCallback(() => {
    const pos = props.getPos();
    if (typeof pos !== 'number') return null;

    const resolvedPos = editor.state.doc.resolve(pos);

    return resolvedPos.before(resolvedPos.depth);
  }, [editor, props]);

  // 应用布局变更
  const applyLayout = useCallback(
    (layout: ColumnLayout) => {
      const parentPos = getParentPosition();
      if (parentPos === null) return;

      editor.chain().focus().setNodeSelection(parentPos).setLayout(layout).run();
    },
    [editor, getParentPosition],
  );

  // 布局切换处理函数
  const onColumnLeft = useCallback(() => {
    if (getParentNode()) {
      applyLayout(ColumnLayout.SidebarLeft);
    }
  }, [getParentNode, applyLayout]);

  const onColumnTwo = useCallback(() => {
    if (getParentNode()) {
      applyLayout(ColumnLayout.TwoColumn);
    }
  }, [getParentNode, applyLayout]);

  const onColumnRight = useCallback(() => {
    if (getParentNode()) {
      applyLayout(ColumnLayout.SidebarRight);
    }
  }, [getParentNode, applyLayout]);

  const insertColumn = useCallback(() => {
    // 获取父节点位置
    const parentPos = getParentPosition();
    if (parentPos === null) return;
    editor.chain().focus().setNodeSelection(parentPos).run();
    setTimeout(() => {
      editor.chain().focus().insertColumn().setColumnClass('add').run();
    }, 50); // 500毫秒延迟
  }, [editor, getParentPosition]);

  // 删除 node
  const deleteColumn = useCallback(() => {
    const parentPos = getParentPosition();
    if (parentPos === null) return;
    props.deleteNode();
    setTimeout(() => {
      editor.chain().focus().setNodeSelection(parentPos).run();
      setTimeout(() => {
        editor.chain().focus().setColumnClass('reduce').run();
      }, 50);
    }, 50);
  }, [editor, getParentPosition, props]);

  // 颜色选择器
  const toggleColorPicker = useCallback(() => {
    setShowColorPicker((prev) => !prev);
  }, []);

  const onColorChange = useCallback(
    (color: string) => {
      setCurrentColor(color);
      updateAttributes({ backgroundColor: color });
    },
    [updateAttributes],
  );

  // 鼠标进入列区域
  const handleMouseEnter = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    setShowToolbar(true);
  }, [hideTimeout]);

  // 鼠标离开列区域
  const handleMouseLeave = useCallback(() => {
    // 延迟隐藏，给鼠标移动到工具栏的时间
    const timeout = setTimeout(() => {
      setShowToolbar(false);
    }, 500); // 500ms延迟隐藏
    setHideTimeout(timeout);
  }, []);

  // 鼠标进入工具栏
  const handleToolbarEnter = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    // 确保工具栏保持显示
    setShowToolbar(true);
  }, [hideTimeout]);

  // 鼠标离开工具栏
  const handleToolbarLeave = useCallback(() => {
    // 延迟隐藏
    const timeout = setTimeout(() => {
      setShowToolbar(false);
    }, 500); // 500ms延迟隐藏
    setHideTimeout(timeout);
  }, []);

  // 拖拽开始处理
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!editor) return;

      // 检查是否允许拖拽（子元素数量大于2时不允许拖拽）
      if (!isDraggable()) {
        e.preventDefault();

        return;
      }

      const element = columnRef.current; // 直接获取 DOM 元素
      const pos = props.getPos(); // 直接获取位置

      if (typeof pos !== 'number') return;

      if (element && pos !== null && pos !== undefined) {
        dragHandlerDirect(e.nativeEvent, editor, element, pos);
      }
    },
    [editor, columnRef.current, isDraggable],
  );

  // 拖拽结束处理
  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      // 清理拖拽状态
      e.preventDefault();

      // 获取父元素属性
      const pos = props.getPos();
      if (typeof pos !== 'number') return;

      const resolvedPos = editor.state.doc.resolve(pos);
      const parentNode = resolvedPos.parent;

      const parentAttrs = parentNode.attrs;
      console.log('🚀 ~ file: ColumnComponent.tsx:219 ~ parentAttrs:', parentAttrs);

      // 更新原来columns的熟悉
      editor
        .chain()
        .focus()
        .setNodeSelection(resolvedPos.before(resolvedPos.depth))
        .updateAttributes('columns', {
          rows: parentAttrs.rows - 1,
        })
        .run();
    },

    [editor, props],
  );

  // 调整大小处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    setShowToolbar(true);
    startWidth.current = columnRef.current?.offsetWidth || 0;
  }, []);

  // 调整大小的副作用
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX.current;
      const newWidth = `${startWidth.current + diff}px`;

      setWidth(newWidth);

      if (editor) {
        editor.commands.updateAttributes('column', { width: newWidth });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, editor]);

  // 布局状态
  const { isColumnLeft, isColumnRight, isColumnTwo } = useEditorState({
    editor,
    selector: (ctx) => ({
      isColumnLeft: ctx.editor.isActive('columns', { layout: ColumnLayout.SidebarLeft }),
      isColumnRight: ctx.editor.isActive('columns', { layout: ColumnLayout.SidebarRight }),
      isColumnTwo: ctx.editor.isActive('columns', { layout: ColumnLayout.TwoColumn }),
    }),
  });

  return (
    <NodeViewWrapper className="column-wrapper" style={{ width }}>
      <div
        ref={columnRef}
        data-type="column"
        data-position={position}
        draggable={isDraggable()}
        data-key={`column-${columnKey}`}
        data-background-color={backgroundColor}
        className={`p-3 rounded relative border-2 border-transparent transition-colors duration-200 ${
          isDraggable()
            ? 'hover:border-blue-400 hover:cursor-grab active:cursor-grabbing'
            : 'hover:border-gray-300 cursor-not-allowed opacity-75'
        }`}
        style={{ backgroundColor }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <NodeViewContent className="column-content" />
        {/* 右侧边框拖拽区域 */}
        <div
          className="absolute top-0 right-0 w-4 h-full cursor-ew-resize z-10"
          style={{ backgroundColor: 'transparent' }}
          onMouseDown={handleMouseDown}
        >
          {showToolbar && (
            <Popover>
              <PopoverTrigger asChild className="absolute  right-0">
                <Toolbar.Button className="!px-0 !rounded-0 !w-1 !min-w-1.5">
                  <Icon name="EllipsisVertical" />
                </Toolbar.Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                sideOffset={-20}
                className="bg-transparent border-none shadow-none"
                onMouseEnter={handleToolbarEnter}
                onMouseLeave={handleToolbarLeave}
              >
                <Toolbar.Wrapper>
                  {/* 布局切换按钮组：默认隐藏，可按需开启 */}
                  <Toolbar.Button
                    tooltip="Sidebar left"
                    active={isColumnLeft}
                    onClick={onColumnLeft}
                  >
                    <Icon name="PanelLeft" />
                  </Toolbar.Button>
                  <Toolbar.Button tooltip="Two columns" active={isColumnTwo} onClick={onColumnTwo}>
                    <Icon name="Columns2" />
                  </Toolbar.Button>
                  <Toolbar.Button
                    tooltip="Sidebar right"
                    active={isColumnRight}
                    onClick={onColumnRight}
                  >
                    <Icon name="PanelRight" />
                  </Toolbar.Button>
                  {/* 增加一个插入按钮 */}
                  <Toolbar.Button tooltip="Insert column" onClick={insertColumn}>
                    <Icon name="Plus" />
                  </Toolbar.Button>
                  {/* 增加一个删除按钮  小于等于2的时候不允许删除*/}
                  {isDraggable() && (
                    <Toolbar.Button tooltip="Delete column" onClick={deleteColumn}>
                      <Icon name="Trash" />
                    </Toolbar.Button>
                  )}
                  <Toolbar.Button tooltip="Column color" onClick={toggleColorPicker}>
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: currentColor }}
                    />
                  </Toolbar.Button>
                  {showColorPicker && (
                    <div className="absolute top-full mt-2 right-0 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <ColorPicker
                        color={currentColor}
                        onChange={onColorChange}
                        onClear={() => onColorChange(DEFAULT_BACKGROUND_COLOR)}
                      />
                    </div>
                  )}
                </Toolbar.Wrapper>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
