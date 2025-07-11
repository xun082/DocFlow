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

    // 服务器端返回一个空的NodeView函数
    return () => ({
      dom: document.createElement('div'),
    });
  },
});
