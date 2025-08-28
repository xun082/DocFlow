import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { AIComponent } from './AIComponent';

export interface AIOptions {
  /**
   * HTML attributes to add to the AI element.
   * @default {}
   */
  HTMLAttributes: Record<string, any>;

  /**
   * AI model to use
   * @default 'gpt-3.5-turbo'
   */
  model: string;

  /**
   * Maximum tokens for AI response
   * @default 1000
   */
  maxTokens: number;

  /**
   * Temperature for AI response
   * @default 0.7
   */
  temperature: number;

  /**
   * Show loading indicator
   * @default true
   */
  showLoading: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ai: {
      /**
       * Insert an AI block
       */
      setAI: (options: { prompt: string; context?: string; op?: string }) => ReturnType;
    };
  }
}

export const AI = Node.create<AIOptions>({
  name: 'ai',

  addOptions() {
    return {
      HTMLAttributes: {},
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7,
      showLoading: true,
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      prompt: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-prompt'),
        renderHTML: (attributes) => {
          if (!attributes.prompt) {
            return {};
          }

          return {
            'data-prompt': attributes.prompt,
          };
        },
      },
      context: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-context'),
        renderHTML: (attributes) => {
          if (!attributes.context) {
            return {};
          }

          return {
            'data-context': attributes.context,
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
      loading: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-loading') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.loading) {
            return {};
          }

          return {
            'data-loading': attributes.loading,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'ai' }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setAI:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIComponent);
  },
});

export default AI;
