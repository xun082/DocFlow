import { useEditorState } from '@tiptap/react';
import { v4 as uuid } from 'uuid';
import { useEffect, useState } from 'react';

import { ColumnLayout } from '../Columns';

import { MenuProps } from '@/components/menus/types';
import { getRenderContainer } from '@/utils/utils/getRenderContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { BubbleMenu } from '@/components/ui/BubbleMenu';
import { ColorPicker } from '@/components/panels/Colorpicker/Colorpicker';

export function ColumnsMenu({ editor }: MenuProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#f3f4f6'); // 默认背景色

  // 查找父节点，直到找到 column 类型的节点
  const findColumnParent = (selection: any) => {
    const { $head } = selection;

    // 从当前位置向上遍历所有父节点
    for (let depth = $head.depth; depth >= 0; depth--) {
      const node = $head.node(depth);

      // 如果找到 column 类型的节点，停止查找
      if (node.type.name === 'column') {
        return {
          node: node,
          depth: depth,
          pos: $head.start(depth) - 1,
        };
      }
    }

    return null; // 没有找到 column 节点
  };

  useEffect(() => {
    const columnParent = findColumnParent(editor.state.selection);

    if (columnParent) {
      setCurrentColor(columnParent.node.attrs.backgroundColor || '#f3f4f6');
    }
  }, [editor.state.selection]);

  const getReferenceClientRect = () => {
    const renderContainer = getRenderContainer(editor, 'column');
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0);

    return rect;
  };

  const shouldShow = () => {
    const isColumn = editor.isActive('column');

    return isColumn;
  };

  const onColumnLeft = () => {
    editor.chain().focus().setLayout(ColumnLayout.SidebarLeft).run();
  };

  const onColumnRight = () => {
    editor.chain().focus().setLayout(ColumnLayout.SidebarRight).run();
  };

  const onColumnTwo = () => {
    editor.chain().focus().setLayout(ColumnLayout.TwoColumn).run();
  };

  const onColorChange = (color: string) => {
    setCurrentColor(color);
    // 是渲染导致的更新，所以需要设置isUpdatAttribute为true
    // setIsUpdatAttribute(true);
    editor
      .chain()
      .focus()
      .updateAttributes('column', {
        backgroundColor: color,
        // 其他属性...
      })
      .run();
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const { isColumnLeft, isColumnRight, isColumnTwo } = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isColumnLeft: ctx.editor.isActive('columns', { layout: ColumnLayout.SidebarLeft }),
        isColumnRight: ctx.editor.isActive('columns', { layout: ColumnLayout.SidebarRight }),
        isColumnTwo: ctx.editor.isActive('columns', { layout: ColumnLayout.TwoColumn }),
      };
    },
  });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={`columnsMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      getReferenceClientRect={getReferenceClientRect}
      // onHide={() => {
      //   if (!isUpdatAttribute) {
      //     setIsUpdatAttribute(false);
      //   }
      // }}
    >
      <Toolbar.Wrapper>
        <Toolbar.Button tooltip="Sidebar left" active={isColumnLeft} onClick={onColumnLeft}>
          <Icon name="PanelLeft" />
        </Toolbar.Button>
        <Toolbar.Button tooltip="Two columns" active={isColumnTwo} onClick={onColumnTwo}>
          <Icon name="Columns2" />
        </Toolbar.Button>
        <Toolbar.Button tooltip="Sidebar right" active={isColumnRight} onClick={onColumnRight}>
          <Icon name="PanelRight" />
        </Toolbar.Button>
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
              onClear={() => onColorChange('#f3f4f6')}
            />
          </div>
        )}
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
}

export default ColumnsMenu;
