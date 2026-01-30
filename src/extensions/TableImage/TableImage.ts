import { mergeAttributes, Range, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import TableImageView from './components/TableImageView';
import { Image } from '../Image';

/**
 * 表格图片属性接口
 */
interface TableImageAttributes {
  src: string;
  alt?: string;
  isTableImage?: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableImage: {
      /**
       * 插入表格图片（缩略图模式）
       */
      setTableImage: (attributes: { src: string }) => ReturnType;
      /**
       * 在指定位置插入表格图片
       */
      setTableImageAt: (attributes: { src: string; pos: number | Range }) => ReturnType;
    };
  }
}

export const TableImage = Image.extend({
  name: 'tableImage',

  group: 'block',

  defining: true,

  isolating: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element: Element) => element.getAttribute('src'),
        renderHTML: (attributes: TableImageAttributes) => ({
          src: attributes.src,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: (element: Element) => element.getAttribute('alt'),
        renderHTML: (attributes: TableImageAttributes) => ({
          alt: attributes.alt,
        }),
      },
      /**
       * 表格图片专用属性：始终保持缩略图尺寸
       */
      isTableImage: {
        default: true,
        parseHTML: () => true,
        renderHTML: () => ({
          'data-table-image': 'true',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-table-image="true"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-table-image': 'true',
        draggable: 'false',
        class: 'table-image',
      }),
    ];
  },

  addCommands() {
    return {
      setTableImage:
        (attrs: { src: string }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src: attrs.src },
          });
        },

      setTableImageAt:
        (attrs: { src: string; pos: number | Range }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContentAt(attrs.pos, {
            type: this.name,
            attrs: { src: attrs.src },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableImageView);
  },
});

export default TableImage;
