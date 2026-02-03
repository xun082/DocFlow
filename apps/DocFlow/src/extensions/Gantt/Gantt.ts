import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { GanttComponent } from './GanttComponent';

export interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  color?: string;
  dependencies?: string; // 任务依赖，格式如 "1, 2" 表示依赖任务1和2
}

export interface GanttAttrs {
  tasks: GanttTask[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gantt: {
      setGantt: (attrs?: { tasks?: GanttTask[] }) => ReturnType;
    };
  }
}

export const Gantt = Node.create({
  name: 'gantt',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      tasks: {
        default: [
          {
            id: '1',
            name: '需求分析',
            startDate: '2025-01-01',
            endDate: '2025-01-06',
            progress: 100,
            color: '#10b981',
            dependencies: '',
          },
          {
            id: '2',
            name: 'UI 设计',
            startDate: '2025-01-04',
            endDate: '2025-01-11',
            progress: 60,
            color: '#3b82f6',
            dependencies: '1',
          },
          {
            id: '3',
            name: '前端开发',
            startDate: '2025-01-09',
            endDate: '2025-01-21',
            progress: 30,
            color: '#f59e0b',
            dependencies: '2',
          },
          {
            id: '4',
            name: '后端开发',
            startDate: '2025-01-09',
            endDate: '2025-01-23',
            progress: 25,
            color: '#8b5cf6',
            dependencies: '2',
          },
          {
            id: '5',
            name: '集成测试',
            startDate: '2025-01-22',
            endDate: '2025-01-29',
            progress: 0,
            color: '#ec4899',
            dependencies: '3, 4',
          },
        ],
        parseHTML: (element) => {
          const tasks = element.getAttribute('data-tasks');

          return tasks ? JSON.parse(tasks) : [];
        },
        renderHTML: (attributes) => {
          return {
            'data-tasks': JSON.stringify(attributes.tasks),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="gantt"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'gantt' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GanttComponent);
  },

  addCommands() {
    return {
      setGantt:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attrs || {},
          });
        },
    };
  },
});

export default Gantt;
