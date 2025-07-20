import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react';
import React, { JSX } from 'react';

import { isColumnGripSelected } from './utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';

export function TableColumnMenu({ editor, appendTo }: MenuProps): JSX.Element {
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
    <BaseBubbleMenu
      editor={editor}
      pluginKey="tableColumnMenu"
      updateDelay={0}
      tippyOptions={{
        appendTo: () => {
          return appendTo?.current;
        },
        offset: [0, 15],
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
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
    </BaseBubbleMenu>
  );
}

export default TableColumnMenu;
