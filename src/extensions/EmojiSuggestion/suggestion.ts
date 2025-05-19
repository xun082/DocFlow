import { ReactRenderer } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { RefAttributes } from 'react';

import EmojiPopover, { EmojiPopoverRef } from './components/EmojiPopover';
import { EmojiListProps } from './types';

export const emojiSuggestion = {
  items: ({ editor, query }: { editor: Editor; query: string }) =>
    editor.storage.emoji.emojis
      .filter(
        ({ shortcodes, tags }: { shortcodes: string[]; tags: string[] }) =>
          shortcodes.find((shortcode) => shortcode.startsWith(query.toLowerCase())) ||
          tags.find((tag) => tag.startsWith(query.toLowerCase())),
      )
      .slice(0, 250),

  allowSpaces: false,

  render: () => {
    let component: ReactRenderer<
      EmojiPopoverRef,
      EmojiListProps & { anchorRect: DOMRect } & RefAttributes<EmojiPopoverRef>
    >;

    return {
      onStart: (props: SuggestionProps<any>) => {
        // Get the anchor rectangle for positioning
        const anchorRect = props.clientRect?.() || new DOMRect(0, 0, 0, 0);

        // Create the React component with EmojiPopover
        component = new ReactRenderer(EmojiPopover, {
          props: {
            ...props,
            anchorRect,
          },
          editor: props.editor,
        });

        // The popover handles all the DOM positioning internally
      },

      onUpdate(props: SuggestionProps<any>) {
        // Get the updated anchor rectangle
        const anchorRect = props.clientRect?.() || new DOMRect(0, 0, 0, 0);

        // Update the component with new props
        component.updateProps({
          ...props,
          anchorRect,
        });
      },

      onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === 'Escape') {
          component.destroy();

          return true;
        }

        return component.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        component.destroy();
      },
    };
  },
};

export default emojiSuggestion;
