import { useEffect } from 'react';
import type { Editor } from '@tiptap/react';

import { storage, STORAGE_KEYS } from '@/utils/storage/local-storage';

/**
 * Once the editor is ready and the collaboration layer has bootstrapped,
 * check localStorage for a pending template and paste it if the document
 * is still empty. Clears the stored template regardless of outcome to avoid
 * re-inserting on future loads.
 */
export function useTemplateInsertion(
  editor: Editor | null,
  documentId: string,
  isReady: boolean,
  isReadOnly: boolean,
): void {
  useEffect(() => {
    if (!editor || !documentId || !isReady || isReadOnly) return;

    const templateContents = storage.get(STORAGE_KEYS.TEMPLATE_CONTENT) || {};
    const docIdString = String(documentId);
    const templateContent = templateContents[docIdString];

    if (!templateContent) return;

    const timer = setTimeout(() => {
      try {
        if (!editor || editor.isDestroyed) return;

        const updatedContents = { ...templateContents };
        delete updatedContents[docIdString];

        if (editor.getText().trim().length > 0) {
          storage.set(STORAGE_KEYS.TEMPLATE_CONTENT, updatedContents);

          return;
        }

        if (!editor.commands.pasteMarkdown) return;

        editor.commands.clearContent();

        if (editor.commands.pasteMarkdown(templateContent)) {
          storage.set(STORAGE_KEYS.TEMPLATE_CONTENT, updatedContents);
          setTimeout(() => editor.commands.focus('start'), 100);
        }
      } catch {
        // silently ignore
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [editor, documentId, isReady, isReadOnly]);
}
