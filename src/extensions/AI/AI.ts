import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Command } from '@tiptap/core';
// import MarkdownIt from 'markdown-it';

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
      setAI: (options: { prompt: string; op?: string; aiState: string }) => ReturnType;

      /**
       * Set streaming preview
       */
      setStreamingPreview: (attrs: Record<string, any>) => ReturnType;

      /**
       * Update streaming content
       */
      updateStreamingContent: (pos: number, content: string) => ReturnType;

      /**
       * Save streaming preview
       */
      saveStreamingPreview: (content: string) => ReturnType;

      /**
       * Remove streaming preview
       */
      removeStreamingPreview: () => ReturnType;
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
      // 我需要在 这里添加一个属性， 来获取后端拿到的aiState
      aiState: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-ai-state'),
        renderHTML: (attributes) => {
          if (!attributes.aiState) {
            return {};
          }

          return {
            'data-ai-state': attributes.aiState,
          };
        },
      },
      op: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-op'),
        renderHTML: (attributes) => {
          if (!attributes.op) {
            return {};
          }

          return {
            'data-op': attributes.op,
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
      setStreamingPreview:
        (attrs): Command =>
        ({ commands, editor }) => {
          const current = editor.$nodes('streamView');

          if (!current || current.length === 0) {
            // No existing stream view nodes
            // const node = this.type.create(attrs);
            commands.insertContent({
              type: this.name,
              attrs: attrs,
            });

            return true;
          } else {
            return false;
          }
        },
      updateStreamingContent:
        (pos: number, content: string): Command =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const node = tr.doc.nodeAt(pos);
            if (!node) return false;

            tr.setNodeAttribute(pos, 'content', content);
          }

          return true;
        },

      // saveStreamingPreview:
      //   (content: string): Command =>
      //   ({ tr, commands, state }) => {
      //     const positions: number[] = [];
      //     state.doc.descendants((node, pos) => {
      //       if (node.type.name === this.name) {
      //         positions.push(pos);
      //       }
      //     });

      //     const md = new MarkdownIt();
      //     console.log('content', content);

      //     const htmlContent = md.render(content);

      //     commands.insertContent(htmlContent); // Insert at the current position

      //     // Delete them in reverse order to maintain positions
      //     positions.reverse().forEach((pos) => {
      //       const currentNode = state.doc.nodeAt(pos);

      //       if (currentNode) {
      //         tr.delete(pos, pos + currentNode.nodeSize);
      //       } else {
      //         console.warn('Node not found at position:', pos);
      //       }
      //     });

      //     return true;
      //   },
      removeStreamingPreview:
        (): Command =>
        ({ tr, state }) => {
          // Find all stream view nodes
          const positions: number[] = [];
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name) {
              positions.push(pos);
            }
          });

          // Delete them in reverse order to maintain positions
          positions.reverse().forEach((pos) => {
            const node = state.doc.nodeAt(pos);

            if (node) {
              tr.delete(pos, pos + node.nodeSize);
            } else {
              console.warn('Node not found at position:', pos);
            }
          });

          return true;
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIComponent);
  },
});

export default AI;
