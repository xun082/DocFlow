import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { AlertComponent } from './AlertComponent';

export type AlertType = 'info' | 'warning' | 'danger' | 'success' | 'note' | 'tip';

export interface AlertOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alert: {
      /**
       * 设置 alert 节点
       */
      setAlert: (type?: AlertType) => ReturnType;
      /**
       * 切换 alert 类型
       */
      toggleAlert: (type?: AlertType) => ReturnType;
      /**
       * 取消 alert
       */
      unsetAlert: () => ReturnType;
    };
  }
}

export const Alert = Node.create<AlertOptions>({
  name: 'alert',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-alert-type') || 'info',
        renderHTML: (attributes) => {
          return {
            'data-alert-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="alert"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;

          const element = node as HTMLElement;
          const type = element.getAttribute('data-alert-type');

          return type ? { type } : false;
        },
      },
      {
        tag: 'div[data-alert-type]',
        getAttrs: (element) => {
          const type = (element as HTMLElement).getAttribute('data-alert-type');

          return type ? { type } : false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'alert',
        class: `alert alert-${node.attrs.type}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAlert:
        (type = 'info') =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { type },
              content: [
                {
                  type: 'paragraph',
                },
              ],
            })
            .run();
        },
      toggleAlert:
        (type = 'info') =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type });
        },
      unsetAlert:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-i': () => this.editor.commands.setAlert('info'),
      'Mod-Shift-w': () => this.editor.commands.setAlert('warning'),
      'Mod-Shift-d': () => this.editor.commands.setAlert('danger'),
      'Mod-Shift-s': () => this.editor.commands.setAlert('success'),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AlertComponent);
  },
});

export default Alert;
