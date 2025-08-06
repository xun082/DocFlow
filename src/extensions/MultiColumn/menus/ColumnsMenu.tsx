import { useEditorState } from '@tiptap/react';
import { v4 as uuid } from 'uuid';

import { ColumnLayout } from '../Columns';

import { MenuProps } from '@/components/menus/types';
import { getRenderContainer } from '@/utils/utils/getRenderContainer';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { BubbleMenu } from '@/components/ui/BubbleMenu';

export function ColumnsMenu({ editor }: MenuProps) {
  const getReferenceClientRect = () => {
    const renderContainer = getRenderContainer(editor, 'columns');
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0);

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
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
}

export default ColumnsMenu;
