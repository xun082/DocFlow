import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const JsonPaste = Extension.create({
  name: 'jsonPaste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('jsonPaste'),
        props: {
          handleDOMEvents: {
            paste: (view, event: ClipboardEvent) => {
              const text = event.clipboardData?.getData('text/json') ?? '';

              if (!text.trim()) {
                return false;
              }

              try {
                const json = JSON.parse(text);

                if (!json || typeof json !== 'object') {
                  return false;
                }

                event.preventDefault();

                const tr = view.state.tr;
                const doc = view.state.schema.nodeFromJSON(json);
                tr.replaceWith(0, view.state.doc.content.size, doc);
                view.dispatch(tr);

                return true;
              } catch (error) {
                console.error('粘贴 JSON 失败:', error);

                return false;
              }
            },
          },
        },
      }),
    ];
  },
});
