import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react';
import React, { JSX } from 'react';

import { isRowGripSelected } from './utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';

export function TableRowMenu({ editor, appendTo }: MenuProps): JSX.Element {
  const shouldShow = ({ view, state, from }: ShouldShowProps) => {
    if (!state || !from) {
      return false;
    }

    return isRowGripSelected({ editor, view, state, from });
  };

  const onAddRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  const onAddRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const onDeleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="tableRowMenu"
      updateDelay={0}
      tippyOptions={{
        appendTo: () => {
          return appendTo?.current;
        },
        placement: 'left',
        offset: [0, 15],
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
      }}
      shouldShow={shouldShow}
    >
      <Toolbar.Wrapper isVertical>
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowUpToLine" />}
          close={false}
          label="Add row before"
          onClick={onAddRowBefore}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowDownToLine" />}
          close={false}
          label="Add row after"
          onClick={onAddRowAfter}
        />
        <PopoverMenu.Item icon="Trash" close={false} label="Delete row" onClick={onDeleteRow} />
      </Toolbar.Wrapper>
    </BaseBubbleMenu>
  );
}

export default TableRowMenu;
