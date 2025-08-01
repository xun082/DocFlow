'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';

import EmojiList from './EmojiList';
import { EmojiListProps } from '../types';

export interface EmojiPopoverProps extends EmojiListProps {
  anchorRect: DOMRect;
}

export interface EmojiPopoverRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const EmojiPopover = forwardRef<EmojiPopoverRef, EmojiPopoverProps>((props, ref) => {
  const emojiListRef = useRef<{ onKeyDown: (evt: SuggestionKeyDownProps) => boolean }>(null);

  // Forward keyDown handling to the EmojiList component
  useImperativeHandle(ref, () => ({
    onKeyDown: (props: SuggestionKeyDownProps) => {
      return emojiListRef.current?.onKeyDown(props) ?? false;
    },
  }));

  return (
    <Popover.Root open>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          sideOffset={0}
          align="start"
          style={{
            position: 'absolute',
            left: props.anchorRect.left + 16, // Add the offset[0] value (16)
            top: props.anchorRect.bottom + 8, // Add the offset[1] value (8)
            zIndex: 9999,
          }}
        >
          <EmojiList {...props} ref={emojiListRef} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});

EmojiPopover.displayName = 'EmojiPopover';

export default EmojiPopover;
