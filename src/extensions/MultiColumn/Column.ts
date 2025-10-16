import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import ColumnComponent from './ColumnComponent';

export const Column = Node.create({
  name: 'column',

  content: 'block+',

  isolating: true,

  addAttributes() {
    return {
      position: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-position'),
        renderHTML: (attributes) => ({ 'data-position': attributes.position }),
      },
      backgroundColor: {
        default: '#f3f4f6',
        parseHTML: (element) => element.getAttribute('data-background-color') || '#f3f4f6',
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};

          return { 'data-background-color': attributes.backgroundColor };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column' }), 0];
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnComponent);
  },
});

export default Column;
