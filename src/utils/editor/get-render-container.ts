/**
 * Get render container for editor nodes
 */

import { Editor } from '@tiptap/react';

/**
 * Get the DOM container element for a specific node type
 * @param editor - TipTap editor instance
 * @param nodeType - Node type to find
 * @returns DOM element or null
 */
export function getRenderContainer(editor: Editor, nodeType: string): HTMLElement | null {
  const {
    view,
    state: {
      selection: { from },
    },
  } = editor;

  const elements = document.querySelectorAll('.has-focus');
  const elementCount = elements.length;
  const innermostNode = elements[elementCount - 1];
  const element = innermostNode;

  if (
    (element &&
      element.getAttribute('data-type') &&
      element.getAttribute('data-type') === nodeType) ||
    (element && element.classList && element.classList.contains(nodeType))
  ) {
    return element as HTMLElement;
  }

  const node = view.domAtPos(from).node as HTMLElement;
  let container: HTMLElement | null = node;

  if (!container.tagName) {
    container = node.parentElement;
  }

  while (
    container &&
    !(container.getAttribute('data-type') && container.getAttribute('data-type') === nodeType) &&
    !container.classList.contains(nodeType)
  ) {
    container = container.parentElement;
  }

  return container;
}
