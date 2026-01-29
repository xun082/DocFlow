import { mergeAttributes, Range, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import ImageBlockView from './components/imageBlockView';
import { Image } from '../Image';

/**
 * 图片块对齐方式
 */
type ImageBlockAlign = 'left' | 'center' | 'right';

/**
 * 图片块属性接口
 */
interface ImageBlockAttributes {
  src: string;
  width?: string;
  align?: ImageBlockAlign;
  alt?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      /**
       * 插入图片块
       */
      setImageBlock: (attributes: { src: string }) => ReturnType;
      /**
       * 在指定位置插入图片块
       */
      setImageBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType;
      /**
       * 设置图片对齐方式
       */
      setImageBlockAlign: (align: ImageBlockAlign) => ReturnType;
      /**
       * 设置图片宽度（百分比）
       */
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
        renderHTML: (attributes: ImageBlockAttributes) => ({
          src: attributes.src,
        }),
      },
      width: {
        default: '100%',
        parseHTML: (element: Element) => element.getAttribute('data-width'),
        renderHTML: (attributes: ImageBlockAttributes) => ({
          'data-width': attributes.width,
        }),
      },
      align: {
        default: 'center',
        parseHTML: (element: Element) => element.getAttribute('data-align'),
        renderHTML: (attributes: ImageBlockAttributes) => ({
          'data-align': attributes.align,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: (element: Element) => element.getAttribute('alt'),
        renderHTML: (attributes: ImageBlockAttributes) => ({
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
      setImageBlock:
        (attrs: { src: string }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src: attrs.src },
          });
        },

      setImageBlockAt:
        (attrs: { src: string; pos: number | Range }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContentAt(attrs.pos, {
            type: this.name,
            attrs: { src: attrs.src },
          });
        },

      setImageBlockAlign:
        (align: ImageBlockAlign) =>
        ({ commands }: CommandProps) => {
          return commands.updateAttributes(this.name, { align });
        },

      setImageBlockWidth:
        (width: number) =>
        ({ commands }: CommandProps) => {
          const clampedWidth = Math.max(0, Math.min(100, width));

          return commands.updateAttributes(this.name, {
            width: `${clampedWidth}%`,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
});

export default ImageBlock;
