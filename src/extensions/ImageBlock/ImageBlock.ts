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

// 通用的对齐类名生成函数
const getAlignClass = (align: string) => {
  switch (align) {
    case 'left':
      return 'text-left';
    case 'right':
      return 'text-right';
    default:
      return 'text-center';
  }
};

// 通用的图片样式生成函数
const getImageStyle = (width?: string) => {
  return width ? `width: ${width}` : undefined;
};

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
    const alignClass = getAlignClass(align);

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
          style: getImageStyle(width),
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
    // 客户端使用React组件提供交互功能
    if (typeof window !== 'undefined') {
      return ReactNodeViewRenderer(ImageBlockView, {
        // 优化React渲染
        attrs: {
          class: 'image-block-wrapper',
        },
        // 确保内容可编辑状态正确
        contentDOMElementTag: 'div',
      });
    }

    // SSR环境使用纯DOM渲染，确保与客户端输出一致
    return ({ node }) => {
      const { src, width, align, alt } = node.attrs;
      const alignClass = getAlignClass(align);

      // 创建figure容器
      const figure = document.createElement('figure');
      figure.setAttribute('data-type', 'imageBlock');
      figure.className = alignClass;
      figure.setAttribute('data-drag-handle', '');

      // 创建内容包装器
      const wrapper = document.createElement('div');
      wrapper.setAttribute('contenteditable', 'false');

      // 创建图片元素
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt || '';
      img.className = 'rounded block h-auto w-full max-w-full';

      const style = getImageStyle(width);

      if (style) {
        img.setAttribute('style', style);
      }

      // 组装DOM结构
      wrapper.appendChild(img);
      figure.appendChild(wrapper);

      return {
        dom: figure,
        contentDOM: wrapper, // 确保内容可以正确编辑
      };
    };
  },
});

export default ImageBlock;
