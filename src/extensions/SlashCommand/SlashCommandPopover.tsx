import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';

import { MenuList } from './MenuList';
import { MenuListProps } from './types';

export interface SlashCommandPopoverProps {
  anchorRect: DOMRect;
  editor: MenuListProps['editor'];
  items: MenuListProps['items'];
  command: MenuListProps['command'];
  [key: string]: any;
}

export interface SlashCommandPopoverRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SlashCommandPopover = forwardRef<SlashCommandPopoverRef, SlashCommandPopoverProps>(
  (props, ref) => {
    const menuListRef = useRef<{ onKeyDown: (evt: SuggestionKeyDownProps) => boolean }>(null);

    // Forward keyDown handling to the MenuList component
    useImperativeHandle(ref, () => ({
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (['ArrowUp', 'ArrowDown', 'Enter'].includes(props.event.key)) {
          props.event.preventDefault();
          props.event.stopPropagation();
        }

        return menuListRef.current?.onKeyDown(props) ?? false;
      },
    }));

    return (
      <Popover.Root open>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            sideOffset={8}
            align="start"
            className="slash-command"
            style={{
              position: 'absolute',
              left: props.anchorRect.left + 16, // Add the offset[0] value (16)
              top: props.anchorRect.bottom + 8, // Add the offset[1] value (8)
              zIndex: 9999,
              maxWidth: '16rem',
            }}
          >
            <MenuList
              editor={props.editor}
              items={props.items}
              command={props.command}
              ref={menuListRef}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

SlashCommandPopover.displayName = 'SlashCommandPopover';

export default SlashCommandPopover;
