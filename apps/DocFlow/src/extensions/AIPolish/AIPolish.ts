import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Command } from '@tiptap/core';

import { AIPolishComponent } from './AIPolishComponent';

export interface AIPolishOptions {
  HTMLAttributes: Record<string, any>;
  model: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiPolish: {
      /**
       * 插入 AI 润色块
       */
      setAIPolish: () => ReturnType;

      /**
       * 更新流式内容
       */
      updatePolishContent: (pos: number, content: string) => ReturnType;
    };
  }
}

export const AIPolish = Node.create<AIPolishOptions>({
  name: 'aiPolish',

  addOptions() {
    return {
      HTMLAttributes: {},
      model: 'deepseek-ai/DeepSeek-V3',
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      originalContent: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-original-content'),
        renderHTML: (attributes) => {
          if (!attributes.originalContent) {
            return {};
          }

          return {
            'data-original-content': attributes.originalContent,
          };
        },
      },
      response: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-response'),
        renderHTML: (attributes) => {
          if (!attributes.response) {
            return {};
          }

          return {
            'data-response': attributes.response,
          };
        },
      },
      state: {
        default: 'input', // input, loading, display
        parseHTML: (element) => element.getAttribute('data-state'),
        renderHTML: (attributes) => {
          if (!attributes.state) {
            return {};
          }

          return {
            'data-state': attributes.state,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai-polish"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'ai-polish' }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setAIPolish:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              state: 'input',
              originalContent: '',
              response: '',
            },
          });
        },
      updatePolishContent:
        (pos: number, content: string): Command =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const node = tr.doc.nodeAt(pos);
            if (!node) return false;

            tr.setNodeAttribute(pos, 'response', content);
          }

          return true;
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIPolishComponent);
  },
});

export default AIPolish;
