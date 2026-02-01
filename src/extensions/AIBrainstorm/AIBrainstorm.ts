import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import AIBrainstormComponent from './AIBrainstormComponent';

export interface AIBrainstormOptions {
  HTMLAttributes: Record<string, any>;
  model?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiBrainstorm: {
      setAIBrainstorm: (options?: { topic?: string }) => ReturnType;
    };
  }
}

export const AIBrainstorm = Node.create<AIBrainstormOptions>({
  name: 'aiBrainstorm',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      model: 'Pro/moonshotai/Kimi-K2.5',
    };
  },

  addAttributes() {
    return {
      topic: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-topic'),
        renderHTML: (attributes) => ({
          'data-topic': attributes.topic,
        }),
      },
      n: {
        default: 3,
        parseHTML: (element) => parseInt(element.getAttribute('data-n') || '3'),
        renderHTML: (attributes) => ({
          'data-n': attributes.n,
        }),
      },
      responses: {
        default: [],
        parseHTML: (element) => {
          const responsesAttr = element.getAttribute('data-responses');

          return responsesAttr ? JSON.parse(responsesAttr) : [];
        },
        renderHTML: (attributes) => ({
          'data-responses': JSON.stringify(attributes.responses),
        }),
      },
      aiState: {
        default: 'input',
        parseHTML: (element) => element.getAttribute('data-ai-state'),
        renderHTML: (attributes) => ({
          'data-ai-state': attributes.aiState,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai-brainstorm"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIBrainstormComponent);
  },

  addCommands() {
    return {
      setAIBrainstorm:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              topic: options.topic || '',
              n: 3,
              responses: [],
              aiState: 'input',
            },
          });
        },
    };
  },
});

export default AIBrainstorm;
