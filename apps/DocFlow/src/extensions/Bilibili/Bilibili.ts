'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { BilibiliComponent } from './BilibiliComponent';

export interface BilibiliOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bilibili: {
      /**
       * Add a Bilibili video player
       */
      setBilibili: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

export const Bilibili = Node.create<BilibiliOptions>({
  name: 'bilibili',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('src'),
        renderHTML: (attributes: { src: string }) => ({
          src: attributes.src,
        }),
      },
      width: {
        default: 560,
        parseHTML: (element: HTMLElement) => element.getAttribute('width'),
        renderHTML: (attributes: { width: number }) => ({
          width: attributes.width,
        }),
      },
      height: {
        default: 315,
        parseHTML: (element: HTMLElement) => element.getAttribute('height'),
        renderHTML: (attributes: { height: number }) => ({
          height: attributes.height,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-bilibili-video]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-bilibili-video': '' }),
    ];
  },

  addCommands() {
    return {
      setBilibili:
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
    return ReactNodeViewRenderer(BilibiliComponent);
  },

  group: 'block',
  draggable: true,
  atom: true,
});

export default Bilibili;
