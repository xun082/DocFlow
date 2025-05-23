import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { MindMapBlockView } from './MindMapBlockView';

export interface MindMapBlockOptions {
  HTMLAttributes: Record<string, any>;
}

export interface MindMapNodeData {
  id: number;
  label: string;
  children?: MindMapNodeData[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mindMapBlock: {
      setMindMapBlock: (attrs?: { data?: MindMapNodeData }) => ReturnType;
    };
  }
}

export const MindMapBlock = Node.create<MindMapBlockOptions>({
  name: 'mindMapBlock',

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
      data: {
        default: {
          id: 1,
          label: '思维导图',
          children: [
            {
              id: 2,
              label: '主题一',
              children: [
                { id: 3, label: '子主题1' },
                { id: 4, label: '子主题2' },
              ],
            },
            {
              id: 5,
              label: '主题二',
              children: [
                { id: 6, label: '子主题3' },
                { id: 7, label: '子主题4' },
              ],
            },
          ],
        },
        parseHTML: (element) => {
          const dataAttr = element.getAttribute('data-mindmap-data');

          if (dataAttr) {
            try {
              return JSON.parse(dataAttr);
            } catch {
              return null;
            }
          }

          return null;
        },
        renderHTML: (attributes) => {
          return {
            'data-mindmap-data': JSON.stringify(attributes.data),
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mindmap-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'mindmap-block',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setMindMapBlock:
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
    return ReactNodeViewRenderer(MindMapBlockView);
  },
});
