import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { alertBaseConfig } from './alertBase';
import type { AlertOptions, AlertType } from './alertBase';
import { AlertComponent } from './AlertComponent';

export type { AlertType, AlertOptions } from './alertBase';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alert: {
      /**
       * Set alert node
       */
      setAlert: (type?: AlertType) => ReturnType;
      /**
       * Toggle alert type
       */
      toggleAlert: (type?: AlertType) => ReturnType;
      /**
       * Unset alert
       */
      unsetAlert: () => ReturnType;
    };
  }
}

export const Alert = Node.create<AlertOptions>({
  ...alertBaseConfig,

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
