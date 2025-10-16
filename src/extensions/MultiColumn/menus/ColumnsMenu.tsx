import { useEditorState } from '@tiptap/react';
import { v4 as uuid } from 'uuid';
import { useState } from 'react';

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
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0); // 当前选中的列索引

  const getReferenceClientRect = () => {
    const renderContainer = getRenderContainer(editor, 'columns');
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0);
    console.log('🚀 ~ file: ColumnsMenu.tsx:21 ~ rect:', rect);

    return rect;
  };

  const shouldShow = () => {
    const isColumns = editor.isActive('columns');

    return isColumns;
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
    editor.chain().focus().setColumnBackgroundColor(selectedColumnIndex, color).run();
  };

  const onColumnSelect = (index: number) => {
    setSelectedColumnIndex(index);
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
      onHide={() => setShowColorPicker(false)}
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
        <Toolbar.Button
          tooltip="Select left column"
          active={selectedColumnIndex === 0}
          onClick={() => onColumnSelect(0)}
        >
          <span className="text-xs font-medium">左列</span>
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Select right column"
          active={selectedColumnIndex === 1}
          onClick={() => onColumnSelect(1)}
        >
          <span className="text-xs font-medium">右列</span>
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
