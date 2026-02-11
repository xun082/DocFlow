import { BubbleMenu } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';
import React, { JSX } from 'react';

import { isColumnGripSelected } from './utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';

export function TableColumnMenu({ editor }: MenuProps): JSX.Element {
  // 使用 useEditorState 订阅编辑器状态变化，作为 BubbleMenu shouldShow 的二次检查
  const { isTableContext } = useEditorState({
    editor,
    selector: (ctx) => ({
      isTableContext:
        ctx.editor.isActive('table') &&
        !ctx.editor.isActive('imageBlock') &&
        !ctx.editor.isActive('tableImage'),
    }),
  });

  const shouldShow = ({ view, state, from }: ShouldShowProps) => {
    if (!state) {
      return false;
    }

    return isColumnGripSelected({ editor, view, state, from: from || 0 });
  };

  const onAddColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  const onAddColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const onDeleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableColumnMenu"
      updateDelay={0}
      options={{
        offset: 15,
      }}
      shouldShow={shouldShow}
    >
      <Toolbar.Wrapper isVertical shouldShowContent={isTableContext}>
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowLeftToLine" />}
          close={false}
          label="Add column before"
          onClick={onAddColumnBefore}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowRightToLine" />}
          close={false}
          label="Add column after"
          onClick={onAddColumnAfter}
        />
        <PopoverMenu.Item
          icon="Trash"
          close={false}
          label="Delete column"
          onClick={onDeleteColumn}
        />
        {/* 增加一个合并单元格的操作 */}
        <PopoverMenu.Item
          iconComponent={<Icon name="TableCellsMerge" />}
          close={false}
          label="Merge cells"
          onClick={() => editor.chain().focus().mergeCells().run()}
        />
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
}

export default TableColumnMenu;
