import { ReactNodeViewRenderer } from '@tiptap/react';
import { mergeAttributes, Range } from '@tiptap/core';

import { ImageBlockView } from './components/ImageBlockView';
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
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      width: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('data-width'),
        renderHTML: (attributes) => ({
          'data-width': attributes.width,
        }),
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align'),
        renderHTML: (attributes) => ({
          'data-align': attributes.align,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => ({
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
      {
        tag: 'figure[data-type="imageBlock"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, width, align, alt } = HTMLAttributes;
    const alignClass =
      align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

    return [
      'figure',
      {
        'data-type': 'imageBlock',
        class: alignClass,
      },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, {
          src,
          alt: alt || '',
          class: 'rounded block h-auto w-full max-w-full',
          style: width ? `width: ${width}` : undefined,
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setImageBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({ type: 'imageBlock', attrs: { src: attrs.src } });
        },

      setImageBlockAt:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContentAt(attrs.pos, {
            type: 'imageBlock',
            attrs: { src: attrs.src },
          });
        },

      setImageBlockAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes('imageBlock', { align }),

      setImageBlockWidth:
        (width) =>
        ({ commands }) =>
          commands.updateAttributes('imageBlock', {
            width: `${Math.max(0, Math.min(100, width))}%`,
          }),
    };
  },

  addNodeView() {
    // 只在客户端环境使用React组件
    if (typeof window !== 'undefined') {
      return ReactNodeViewRenderer(ImageBlockView);
    }

    // SSR环境使用简单的DOM渲染
    return ({ node }) => {
      const { src, width, align, alt } = node.attrs;
      const alignClass =
        align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

      const figure = document.createElement('figure');
      figure.setAttribute('data-type', 'imageBlock');
      figure.className = alignClass;

      const img = document.createElement('img');
      img.src = src;
      img.alt = alt || '';
      img.className = 'rounded block h-auto w-full max-w-full';

      if (width) {
        img.style.width = width;
      }

      figure.appendChild(img);

      return {
        dom: figure,
      };
    };
  },
});

export default ImageBlock;
