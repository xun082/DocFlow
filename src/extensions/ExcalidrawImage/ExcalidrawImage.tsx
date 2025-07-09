import { Node, ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    excalidrawImage: {
      setExcalidrawImage: (attrs: Record<string, any>) => ReturnType;
    };
  }
}

// SVG 渲染组件
const ExcalidrawImageNodeView: React.FC<NodeViewProps> = ({ node }) => {
  const svg = node.attrs.svg || '';

  return (
    <NodeViewWrapper data-type="excalidraw-image">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </NodeViewWrapper>
  );
};

export const ExcalidrawImage = Node.create({
  name: 'excalidrawImage',

  isolating: true,
  defining: true,
  group: 'block',
  draggable: true,
  selectable: true,
  inline: false,

  addAttributes() {
    return {
      svg: {
        default: '',
        parseHTML: (element: Element) => {
          if (!element || typeof (element as any).querySelector !== 'function') return '';

          return (element as HTMLElement).querySelector('svg')?.outerHTML || '';
        },
        renderHTML: (attributes: any) => ({
          'data-excalidraw-image': attributes.svg || '',
        }),
      },
      name: {
        default: '',
      },
      id: {
        default: '',
        renderHTML: (attributes: any) => (attributes.id ? { id: attributes.id } : {}),
      },
      class: {
        default: '',
        renderHTML: (attributes: any) => (attributes.class ? { class: attributes.class } : {}),
      },
      width: {
        default: '',
        renderHTML: (attributes: any) => (attributes.width ? { width: attributes.width } : {}),
      },
      height: {
        default: '',
        renderHTML: (attributes: any) => (attributes.height ? { height: attributes.height } : {}),
      },
      style: {
        default: '',
        renderHTML: (attributes: any) => (attributes.style ? { style: attributes.style } : {}),
      },
      fill: {
        default: '',
        renderHTML: (attributes: any) => (attributes.fill ? { fill: attributes.fill } : {}),
      },
      stroke: {
        default: '',
        renderHTML: (attributes: any) => (attributes.stroke ? { stroke: attributes.stroke } : {}),
      },
      strokeWidth: {
        default: '',
        renderHTML: (attributes: any) =>
          attributes.strokeWidth ? { strokeWidth: attributes.strokeWidth } : {},
      },
      // 可扩展更多自定义属性
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="excalidraw-image"]',
      },
      {
        tag: 'svg',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }: any) {
    // 合并自定义属性
    const attrs = { ...HTMLAttributes };
    if (node.attrs.id) attrs.id = node.attrs.id;
    if (node.attrs.class) attrs.class = node.attrs.class;

    return [
      'div',
      { ...attrs, 'data-type': 'excalidraw-image' },
      node.attrs.svg ? { html: node.attrs.svg } : '',
    ];
  },

  addCommands() {
    return {
      setExcalidrawImage:
        (attrs: Record<string, any> = {}) =>
          ({ commands }: any) =>
            commands.insertContent({ type: this.name, attrs }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawImageNodeView);
  },
});

export default ExcalidrawImage;
