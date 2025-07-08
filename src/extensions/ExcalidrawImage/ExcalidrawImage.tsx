import { Node, ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    excalidrawImage: {
      setExcalidrawImage: (svg: string, fileName: string) => ReturnType;
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
      fileName: {
        default: '',
      },
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
    return [
      'div',
      { ...HTMLAttributes, 'data-type': 'excalidraw-image' },
      node.attrs.svg ? { html: node.attrs.svg } : '',
    ];
  },

  addCommands() {
    return {
      setExcalidrawImage:
        (svg: string, fileName: string = '') =>
          ({ commands }: any) =>
            commands.insertContent({
              type: 'excalidrawImage',
              attrs: { svg, fileName },
            }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawImageNodeView);
  },
});

export default ExcalidrawImage;
