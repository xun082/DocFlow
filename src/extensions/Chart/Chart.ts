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
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-chart]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-chart': '', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer<{
      type: 'bar' | 'line' | 'pie' | 'area';
      data: Array<Record<string, any>>;
      title?: string;
      xAxisKey: string;
      yAxisKeys?: string[];
      colorKey?: string;
    }>(ChartComponent as any);
  },

  addCommands() {
    return {
      setChart:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default Chart;
