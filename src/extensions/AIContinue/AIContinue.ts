import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Command } from '@tiptap/core';

import { AIContinueComponent } from './AIContinueComponent';

export interface AIContinueOptions {
  HTMLAttributes: Record<string, any>;
  model: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiContinue: {
      /**
       * 插入 AI 续写块
       */
      setAIContinue: () => ReturnType;

      /**
       * 更新流式内容
       */
      updateContinueContent: (pos: number, content: string) => ReturnType;
    };
  }
}

export const AIContinue = Node.create<AIContinueOptions>({
  name: 'aiContinue',

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
        tag: 'div[data-type="ai-continue"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'ai-continue' }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setAIContinue:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              state: 'input',
              response: '',
            },
          });
        },
      updateContinueContent:
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
    return ReactNodeViewRenderer(AIContinueComponent);
  },
});

export default AIContinue;
