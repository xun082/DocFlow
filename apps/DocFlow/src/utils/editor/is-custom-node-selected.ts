/**
 * Check if custom node is selected in editor
 */

import { Editor } from '@tiptap/react';

import {
  Figcaption,
  HorizontalRule,
  ImageBlock,
  ImageUpload,
  Link,
  CodeBlock,
  Chart,
  Countdown,
  TableImage,
} from '@/extensions';
import { TableOfContentsNode } from '@/extensions/TableOfContentsNode';

/**
 * Check if a custom node type is currently selected
 * @param editor - TipTap editor instance
 * @param node - DOM node to check
 * @returns True if custom node is selected
 */
export function isCustomNodeSelected(editor: Editor): boolean {
  const customNodes = [
    HorizontalRule.name,
    ImageBlock.name,
    ImageUpload.name,
    CodeBlock.name,
    Link.name,
    Figcaption.name,
    TableOfContentsNode.name,
    Chart.name,
    Countdown.name,
    TableImage.name,
    'inlineMath',
    'blockMath',
  ];

  return customNodes.some((type) => editor.isActive(type));
}
