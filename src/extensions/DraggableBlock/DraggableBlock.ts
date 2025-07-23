import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { DraggableBlockView } from './DraggableBlockView';

export interface DraggableBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    draggableBlock: {
      setDraggableBlock: (attrs?: { blockType?: string }) => ReturnType;
    };
  }
}

export const DraggableBlock = Node.create<DraggableBlockOptions>({
  name: 'draggableBlock',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'block',

  defining: true,

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      blockType: {
        default: 'default',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
        'data-block-type': HTMLAttributes.blockType,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setDraggableBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'paragraph' }],
          });
        },
    };
  },

  addNodeView() {
    if (typeof window !== 'undefined') {
      return ReactNodeViewRenderer(DraggableBlockView);
    }

    return ({ node }) => {
      const div = document?.createElement ? document.createElement('div') : null;

      if (div) {
        div.setAttribute('data-type', 'draggableBlock');
        div.setAttribute('data-block-type', node.attrs.blockType || 'default');
      }

      return {
        dom: div || ({ tagName: 'div' } as any),
        contentDOM: div || ({ tagName: 'div' } as any),
      };
    };
  },
});
