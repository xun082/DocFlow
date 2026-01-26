import { Editor } from '@tiptap/core';
import { JSONContent } from '@tiptap/core';

import { ExtensionKit } from '@/extensions/extension-kit';
import { MarkdownPaste } from '@/extensions/MarkdownPaste';

export interface TemplateToTiptapOptions {
  content: string;
}

export function templateToTiptapJSON(options: TemplateToTiptapOptions): JSONContent {
  const { content } = options;

  if (!content || content.trim() === '') {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      },
    ],
  };
}

export async function templateToTiptapJSONWithEditor(
  options: TemplateToTiptapOptions,
): Promise<JSONContent> {
  const { content } = options;

  if (!content || content.trim() === '') {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  return new Promise((resolve) => {
    let editorInstance: Editor | null = null;

    editorInstance = new Editor({
      content: content,
      extensions: [
        ...ExtensionKit({ provider: null }),
        MarkdownPaste.configure({
          transformPastedText: true,
        }),
      ],
      editorProps: {
        attributes: {
          class: 'hidden',
        },
      },
      onCreate: ({ editor }) => {
        editorInstance = editor;
      },
      onSelectionUpdate: ({ editor }) => {
        if (editorInstance) {
          const json = editor.getJSON();
          editorInstance.destroy();
          resolve(json);
        }
      },
    });

    // 超时处理，确保即使没有触发 onSelectionUpdate 也能解析
    setTimeout(() => {
      if (editorInstance) {
        const json = editorInstance.getJSON();
        editorInstance.destroy();
        resolve(json);
      }
    }, 500);
  });
}
