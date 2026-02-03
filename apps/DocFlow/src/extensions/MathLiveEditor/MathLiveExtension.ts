import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { MathLivePopover } from './MathLivePopover';

export interface MathLiveExtensionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathLiveEditor: {
      /**
       * 打开 MathLive 编辑器
       */
      openMathLiveEditor: () => ReturnType;
    };
  }
}

export const MathLiveExtension = Extension.create<MathLiveExtensionOptions>({
  name: 'mathLiveEditor',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      openMathLiveEditor:
        () =>
        ({ editor, chain }) => {
          const { view } = editor;
          const { from } = view.state.selection;

          // 创建 React 组件
          const component = new ReactRenderer(MathLivePopover, {
            props: {
              editor,
              onInsert: (latex: string) => {
                chain()
                  .focus()
                  .insertContentAt(from, [
                    {
                      type: 'inlineMath',
                      attrs: { latex },
                    },
                    { type: 'text', text: ' ' },
                  ])
                  .run();
                component.destroy();
              },
              onCancel: () => {
                component.destroy();
                editor.commands.focus();
              },
            },
            editor,
          });

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl/Cmd + M 打开公式编辑器
      'Mod-m': () => this.editor.commands.openMathLiveEditor(),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('mathLiveEditor'),
        props: {
          handleKeyDown: () => {
            // 可以在这里添加额外的键盘处理逻辑
            return false;
          },
        },
      }),
    ];
  },
});
