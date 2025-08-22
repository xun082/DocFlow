import { mergeAttributes, Range, ChainedCommands, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import ImageBlockView from './components/imageBlockView';
import { Image } from '../Image';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string }) => ReturnType;
      setImageBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType;
      setImageBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType;
      setImageBlockWidth: (width: number) => ReturnType;
    };
  }
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const ImageBlock = Image.extend({
  name: 'imageBlock',

  group: 'block',

  defining: true,

  isolating: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element: Element) => element.getAttribute('src'),
        renderHTML: (attributes: any) => ({
          src: attributes.src,
        }),
      },
      width: {
        default: '100%',
        parseHTML: (element: Element) => element.getAttribute('data-width'),
        renderHTML: (attributes: any) => ({
          'data-width': attributes.width,
        }),
      },
      align: {
        default: 'center',
        parseHTML: (element: Element) => element.getAttribute('data-align'),
        renderHTML: (attributes: any) => ({
          'data-align': attributes.align,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: (element: Element) => element.getAttribute('alt'),
        renderHTML: (attributes: any) => ({
          alt: attributes.alt,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src*="tiptap.dev"]:not([src^="data:"]), img[src*="windows.net"]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImageBlock:
        (attrs: { src: string }) =>
        ({ commands }: { commands: ChainedCommands }) => {
          return commands.insertContent({ type: 'imageBlock', attrs: { src: attrs.src } });
        },

      setImageBlockAt:
        (attrs: { src: string; pos: number | Range }) =>
        ({ commands }: { commands: ChainedCommands }) => {
          return commands.insertContentAt(attrs.pos, {
            type: 'imageBlock',
            attrs: { src: attrs.src },
          });
        },

      setImageBlockAlign:
        (align: 'left' | 'center' | 'right') =>
        ({ commands }: { commands: ChainedCommands }) =>
          commands.updateAttributes('imageBlock', { align }),

      setImageBlockWidth:
        (width: number) =>
        ({ commands }: { commands: ChainedCommands }) =>
          commands.updateAttributes('imageBlock', {
            width: `${Math.max(0, Math.min(100, width))}%`,
          }),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          console.log('textblockTypeInputRule', match);

          const [, , alt, src, title] = match;

          return { src, alt, title };
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
});

export default ImageBlock;
