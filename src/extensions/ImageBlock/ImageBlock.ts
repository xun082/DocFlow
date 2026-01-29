import { mergeAttributes, Range } from '@tiptap/core';
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
      // {
      //   tag: 'img[src]:not([src^="http"]):not([src^="//"])',
      //   getAttrs: (element: HTMLElement) => {
      //     const src = (element as HTMLElement).getAttribute('src')?.trim();
      //     // 确保不是外部链接
      //     if (src && !src.startsWith('http') && !src.startsWith('//')) {
      //       return { src };
      //     }
      //     return false;
      //   },
      // },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImageBlock: (attrs: { src: string }) => (props) => {
        return props.commands.insertContent({ type: 'imageBlock', attrs: { src: attrs.src } });
      },

      setImageBlockAt: (attrs: { src: string; pos: number | Range }) => (props) => {
        return props.commands.insertContentAt(attrs.pos, {
          type: 'imageBlock',
          attrs: { src: attrs.src },
        });
      },

      setImageBlockAlign: (align: 'left' | 'center' | 'right') => (props) =>
        props.commands.updateAttributes('imageBlock', { align }),

      setImageBlockWidth: (width: number) => (props) =>
        props.commands.updateAttributes('imageBlock', {
          width: `${Math.max(0, Math.min(100, width))}%`,
        }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
});

export default ImageBlock;
