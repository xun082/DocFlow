import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import ChartComponent from './ChartComponent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chart: {
      /**
       * Add a chart
       */
      setChart: (options: {
        type: 'bar' | 'line' | 'pie' | 'area';
        data: Array<Record<string, any>>;
        title?: string;
        xAxisKey?: string;
        yAxisKeys?: string[];
        colorKey?: string;
      }) => ReturnType;
    };
  }
}

export const Chart = Node.create({
  name: 'chart',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      type: {
        default: 'bar',
      },
      data: {
        default: [],
      },
      title: {
        default: '',
      },
      xAxisKey: {
        default: 'name',
      },
      yAxisKeys: {
        default: [],
      },
      colorKey: {
        default: 'red',
      },
      png: { default: null }, // 保存 base64
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-chart]',
      },
    ];
  },

  renderHTML({ node }) {
    if (node.attrs.png) {
      return [
        'img',
        {
          src: node.attrs.png,
          alt: node.attrs.title || '图表',
          style: 'max-width: 100%; height: auto; display: block; margin: 10px 0;',
        },
      ];
    }

    // fallback
    return [
      'div',
      { style: 'padding: 40px; background: #f8f8f8; text-align: center; border: 2px dashed #ddd;' },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer<{
      type: 'bar' | 'line' | 'pie' | 'area';
      data: Array<Record<string, any>>;
      title?: string;
      xAxisKey: string;
      yAxisKeys: string[];
      colorKey?: string;
    }>(ChartComponent as any);
  },

  addCommands() {
    return {
      setChart:
        (options) =>
        ({ commands }) => {
          console.log('options', options);

          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default Chart;
