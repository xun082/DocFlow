import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import TextToImageComponent from './TextToImageComponent';

export interface TextToImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textToImage: {
      /**
       * 插入文生图节点
       */
      setTextToImage: () => ReturnType;
    };
  }
}

export const TextToImage = Node.create<TextToImageOptions>({
  name: 'textToImage',

  group: 'block',

  atom: true,

  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      prompt: {
        default: '',
      },
      size: {
        default: '1328x1328',
      },
      imageUrl: {
        default: '',
      },
      state: {
        default: 'input', // input, loading, display
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="text-to-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'text-to-image' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TextToImageComponent);
  },

  addCommands() {
    return {
      setTextToImage:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              prompt: '',
              size: '1328x1328',
              imageUrl: '',
              state: 'input',
            },
          });
        },
    };
  },
});
