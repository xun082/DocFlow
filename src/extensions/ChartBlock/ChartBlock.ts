import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { ChartBlockView } from './ChartBlockView';

export interface ChartBlockOptions {
  HTMLAttributes: Record<string, any>;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'heatmap' | 'gauge' | 'funnel';
  title: string;
  data: any[];
  options?: any;
  theme?: 'light' | 'dark' | 'vintage' | 'macarons' | 'roma' | 'shine';
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chartBlock: {
      setChartBlock: (attrs?: { config?: ChartConfig }) => ReturnType;
    };
  }
}

export const ChartBlock = Node.create<ChartBlockOptions>({
  name: 'chartBlock',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',
  content: '',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      config: {
        default: {
          type: 'bar',
          title: '销售数据统计',
          theme: 'macarons',
          data: [
            { name: 'Q1', value: 1200, category: '第一季度' },
            { name: 'Q2', value: 1800, category: '第二季度' },
            { name: 'Q3', value: 1500, category: '第三季度' },
            { name: 'Q4', value: 2200, category: '第四季度' },
          ],
          options: {},
        },
        parseHTML: (element) => {
          const dataAttr = element.getAttribute('data-chart-config');

          if (dataAttr) {
            try {
              return JSON.parse(dataAttr);
            } catch {
              return null;
            }
          }

          return null;
        },
        renderHTML: (attributes) => {
          return {
            'data-chart-config': JSON.stringify(attributes.config),
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'chart-block',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setChartBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBlockView);
  },
});
