import type { NodeConfig } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/core';

export type AlertType = 'info' | 'warning' | 'danger' | 'success' | 'note' | 'tip';

export interface AlertOptions {
  HTMLAttributes: Record<string, any>;
}

/**
 * Shared alert node configuration
 * Used by both Alert.ts (with React) and AlertSchema.ts (schema-only)
 */
export const alertBaseConfig: Pick<
  NodeConfig<AlertOptions>,
  | 'name'
  | 'group'
  | 'content'
  | 'defining'
  | 'addOptions'
  | 'addAttributes'
  | 'parseHTML'
  | 'renderHTML'
> = {
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
        getAttrs: (node) => {
          if (typeof node === 'string') return false;

          const element = node as HTMLElement;
          const type = element.getAttribute('data-alert-type');

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
};
