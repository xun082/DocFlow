import { ReactRenderer } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { RefAttributes } from 'react';
import { PluginKey } from '@tiptap/pm/state';

import EmojiPopover, { EmojiPopoverRef } from './components/EmojiPopover';
import { EmojiListProps } from './types';

const extensionName = 'emojiCommand';

export const emojiSuggestion = {
  name: extensionName,
  pluginKey: new PluginKey(extensionName),
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

    let scrollHandler: (() => void) | null = null;

    return {
      onStart: (props: SuggestionProps<any>) => {
        const view = props.editor.view;
        // Get the anchor rectangle for positioning

        const getReferenceClientRect = () => {
          if (!props.clientRect) {
            return (props.editor.storage as any)[extensionName]?.rect;
          }

          const rect = props.clientRect();

          if (!rect) {
            return (props.editor.storage as any)[extensionName]?.rect;
          }

          let yPos = rect.y;

          if (rect.top + 300 > window.innerHeight) {
            // 300 is an estimate for popover height
            const diff = rect.top + 300 - window.innerHeight + 40;
            yPos = rect.y - diff;
          }

          return new DOMRect(rect.x, yPos, rect.width, rect.height);
        };

        // Create the React component with EmojiPopover
        component = new ReactRenderer(EmojiPopover, {
          props: {
            ...props,
            anchorRect: getReferenceClientRect(),
          },
          editor: props.editor,
        });

        scrollHandler = () => {
          if (!getReferenceClientRect()) return;
          component.updateProps({
            anchorRect: getReferenceClientRect(),
          });
        };

        view.dom.parentElement?.parentElement?.addEventListener('scroll', scrollHandler);

        // The popover handles all the DOM positioning internally
      },

      onUpdate(props: SuggestionProps<any>) {
        // Get the updated anchor rectangle
        // const anchorRect = props.clientRect?.() || new DOMRect(0, 0, 0, 0);

        const getReferenceClientRect = () => {
          if (!props.clientRect) {
            return (props.editor.storage as any)[extensionName]?.rect;
          }

          const rect = props.clientRect();

          if (!rect) {
            return (props.editor.storage as any)[extensionName]?.rect;
          }

          let yPos = rect.y;

          if (rect.top + 300 > window.innerHeight) {
            const diff = rect.top + 300 - window.innerHeight + 40;
            yPos = rect.y - diff;
          }

          return new DOMRect(rect.x, yPos, rect.width, rect.height);
        };

        (props.editor.storage as any)[extensionName] = {
          rect: props.clientRect
            ? getReferenceClientRect()
            : {
                width: 0,
                height: 0,
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
              },
        };

        const anchorRect = getReferenceClientRect();

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
