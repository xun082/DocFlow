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
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    countdown: {
      /**
       * Insert a countdown block
       */
      setCountdown: (options: {
        targetDate?: string;
        showDays?: boolean;
        showHours?: boolean;
        showMinutes?: boolean;
        showSeconds?: boolean;
      }) => ReturnType;
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
    };
  },
});
