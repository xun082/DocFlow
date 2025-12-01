'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';

import MentionList from './MentionList';
import { MentionListProps } from '../types';

export interface MentionPopoverProps extends MentionListProps {
  anchorRect: DOMRect;
}

export interface MentionPopoverRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const MentionPopover = forwardRef<MentionPopoverRef, MentionPopoverProps>((props, ref) => {
  const mentionListRef = useRef<{ onKeyDown: (evt: SuggestionKeyDownProps) => boolean }>(null);

  // Forward keyDown handling to the MentionList component
  useImperativeHandle(ref, () => ({
    onKeyDown: (props: SuggestionKeyDownProps) => {
      return mentionListRef.current?.onKeyDown(props) ?? false;
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
            left: props.anchorRect.left + 16,
            top: props.anchorRect.bottom + 8,
            zIndex: 9999,
          }}
        >
          <MentionList {...props} ref={mentionListRef} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});

MentionPopover.displayName = 'MentionPopover';

export default MentionPopover;
