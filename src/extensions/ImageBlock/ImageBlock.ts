import { mergeAttributes, Range, ChainedCommands, Editor } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

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

  addNodeView() {
    // 工具函数：获取对齐样式类名
    const getAlignClassName = (align: string): string => {
      const alignClasses = {
        left: 'ml-0 mr-auto',
        right: 'mr-0 ml-auto',
        center: 'mx-auto',
      } as const;

      return alignClasses[align as keyof typeof alignClasses] || alignClasses.center;
    };

    // 工具函数：创建图片元素
    const createImageElement = (attrs: Record<string, any>): HTMLImageElement => {
      const img = document.createElement('img');
      img.className = 'block';
      img.src = attrs.src;
      img.alt = attrs.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';

      return img;
    };

    // 工具函数：创建包装容器
    const createWrapperElement = (attrs: Record<string, any>): HTMLDivElement => {
      const wrapper = document.createElement('div');
      wrapper.className = getAlignClassName(attrs.align || 'center');
      wrapper.style.width = attrs.width || '100%';
      wrapper.setAttribute('data-drag-handle', '');

      return wrapper;
    };

    // 工具函数：更新元素样式
    const updateElementStyles = (
      wrapper: HTMLDivElement,
      img: HTMLImageElement,
      attrs: Record<string, any>,
    ): void => {
      img.src = attrs.src;
      wrapper.style.width = attrs.width || '100%';
      wrapper.className = getAlignClassName(attrs.align || 'center');
    };

    // 工具函数：添加点击事件处理
    const addClickHandler = (
      img: HTMLImageElement,
      getPos: () => number | undefined,
      editor: Editor,
    ): void => {
      img.addEventListener('click', () => {
        // 使用 requestAnimationFrame 代替 setTimeout 以获得更好的性能
        requestAnimationFrame(() => {
          const pos = getPos();

          if (typeof pos === 'number') {
            editor.commands.setNodeSelection(pos);
          }
        });
      });
    };

    return ({
      node,
      getPos,
      editor,
    }: {
      node: ProseMirrorNode;
      getPos: () => number | undefined;
      editor: Editor;
    }) => {
      // 创建 DOM 结构
      const container = document.createElement('div');
      const wrapper = createWrapperElement(node.attrs);
      const img = createImageElement(node.attrs);

      // 添加事件处理
      addClickHandler(img, getPos, editor);

      // 构建 DOM 层次结构
      const innerWrapper = document.createElement('div');
      innerWrapper.contentEditable = 'false';
      innerWrapper.appendChild(img);
      wrapper.appendChild(innerWrapper);
      container.appendChild(wrapper);

      return {
        dom: container,
        update: (updatedNode: ProseMirrorNode): boolean => {
          if (updatedNode.type.name !== 'imageBlock') {
            return false;
          }

          updateElementStyles(wrapper, img, updatedNode.attrs);

          return true;
        },
      };
    };
  },
});

export default ImageBlock;
