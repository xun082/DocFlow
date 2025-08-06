import { BubbleMenu } from '@tiptap/react/menus';
import React, { JSX } from 'react';

import { isColumnGripSelected } from './utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';

export function TableColumnMenu({ editor }: MenuProps): JSX.Element {
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
      <Toolbar.Wrapper isVertical>
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
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
}

export default TableColumnMenu;
