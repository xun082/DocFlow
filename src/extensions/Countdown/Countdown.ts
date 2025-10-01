import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { CountdownComponent } from './CountdownComponent';

export interface CountdownOptions {
  /**
   * HTML attributes to add to the countdown element
   * @default {}
   */
  HTMLAttributes: Record<string, any>;

  /**
   * Default target date for countdown
   * @default null
   */
  defaultTargetDate: string | null;

  /**
   * Whether to show days in countdown
   * @default true
   */
  showDays: boolean;

  /**
   * Whether to show hours in countdown
   * @default true
   */
  showHours: boolean;

  /**
   * Whether to show minutes in countdown
   * @default true
   */
  showMinutes: boolean;

  /**
   * Whether to show seconds in countdown
   * @default true
   */
  showSeconds: boolean;

  /**
   * Countdown title
   * @default ''
   */
  title: string;

  /**
   * Countdown description
   * @default ''
   */
  description: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    countdown: {
      /**
       * Insert a countdown block
       */
      setCountdown: (options: {
        targetDate?: string;
        title?: string;
        description?: string;
        showDays?: boolean;
        showHours?: boolean;
        showMinutes?: boolean;
        showSeconds?: boolean;
      }) => ReturnType;

      /**
       * Update countdown target date
       */
      updateCountdownTargetDate: (targetDate: string) => ReturnType;

      /**
       * Update countdown title
       */
      updateCountdownTitle: (title: string) => ReturnType;

      /**
       * Update countdown description
       */
      updateCountdownDescription: (description: string) => ReturnType;
    };
  }
}

export const Countdown = Node.create<CountdownOptions>({
  name: 'countdown',

  addOptions() {
    return {
      HTMLAttributes: {},
      defaultTargetDate: null,
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      title: '',
      description: '',
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      targetDate: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-target-date'),
        renderHTML: (attributes) => {
          if (!attributes.targetDate) {
            return {};
          }

          return {
            'data-target-date': attributes.targetDate,
          };
        },
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }

          return {
            'data-title': attributes.title,
          };
        },
      },
      description: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-description'),
        renderHTML: (attributes) => {
          if (!attributes.description) {
            return {};
          }

          return {
            'data-description': attributes.description,
          };
        },
      },
      showDays: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-show-days') === 'true',
        renderHTML: (attributes) => ({
          'data-show-days': attributes.showDays,
        }),
      },
      showHours: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-show-hours') === 'true',
        renderHTML: (attributes) => ({
          'data-show-hours': attributes.showHours,
        }),
      },
      showMinutes: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-show-minutes') === 'true',
        renderHTML: (attributes) => ({
          'data-show-minutes': attributes.showMinutes,
        }),
      },
      showSeconds: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-show-seconds') === 'true',
        renderHTML: (attributes) => ({
          'data-show-seconds': attributes.showSeconds,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="countdown"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'countdown' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CountdownComponent);
  },

  addCommands() {
    return {
      setCountdown:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      updateCountdownTargetDate:
        (targetDate) =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;
          let found = false;

          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === this.name) {
              commands.updateAttributes(this.name, { targetDate });
              found = true;
            }
          });

          return found;
        },
      updateCountdownTitle:
        (title) =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;
          let found = false;

          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === this.name) {
              commands.updateAttributes(this.name, { title });
              found = true;
            }
          });

          return found;
        },
      updateCountdownDescription:
        (description) =>
        ({ commands, editor }) => {
          const { from, to } = editor.state.selection;
          let found = false;

          editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === this.name) {
              commands.updateAttributes(this.name, { description });
              found = true;
            }
          });

          return found;
        },
    };
  },
});
