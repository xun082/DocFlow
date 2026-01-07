/**
 * Check if text is selected in editor
 */

import { isTextSelection } from '@tiptap/core';
import { Editor } from '@tiptap/react';

/**
 * Check if text is currently selected in the editor
 * @param editor - TipTap editor instance
 * @returns True if text is selected
 */
export function isTextSelected({ editor }: { editor: Editor }): boolean {
  const {
    state: {
      doc,
      selection,
      selection: { empty, from, to },
    },
  } = editor;

  // Check for empty selection
  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection);

  if (empty || isEmptyTextBlock || !editor.isEditable) {
    return false;
  }

  return true;
}
