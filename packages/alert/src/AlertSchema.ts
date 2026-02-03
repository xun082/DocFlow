import { mergeAttributes, Node } from '@tiptap/core';

export type AlertType = 'info' | 'warning' | 'danger' | 'success' | 'note' | 'tip';

export interface AlertOptions {
  HTMLAttributes: Record<string, any>;
}

/**
 * Alert node schema without React dependency
 * Use this for server-side transformations and non-React environments
 */
export const AlertSchema = Node.create<AlertOptions>({
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
});

export default AlertSchema;
