import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { CustomBlockView } from './CustomBlockView';

export interface CustomBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customBlock: {
      setCustomBlock: (attrs?: { title?: string; description?: string }) => ReturnType;
    };
  }
}

export const CustomBlock = Node.create<CustomBlockOptions>({
  name: 'customBlock',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',
  content: '',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      title: { default: '' },
      description: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="custom-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'custom-block',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCustomBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomBlockView);
  },
});
