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
  Audio,
  TextToImage,
  Bilibili,
  Chart,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Countdown,
} from '@/extensions';
import { TableOfContentsNode } from '@/extensions/TableOfContentsNode';

/**
 * Check if table grip is selected
 * @param node - DOM element to check
 * @returns True if table grip is selected
 */
export function isTableGripSelected(node: HTMLElement): boolean {
  let container = node;

  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement!;
  }

  const gripColumn =
    container && container.querySelector && container.querySelector('a.grip-column.selected');
  const gripRow =
    container && container.querySelector && container.querySelector('a.grip-row.selected');

  return !!(gripColumn || gripRow);
}

/**
 * Check if a custom node type is currently selected
 * @param editor - TipTap editor instance
 * @param node - DOM node to check
 * @returns True if custom node is selected
 */
export function isCustomNodeSelected(editor: Editor, node: HTMLElement): boolean {
  const customNodes = [
    HorizontalRule.name,
    ImageBlock.name,
    ImageUpload.name,
    CodeBlock.name,
    Link.name,
    Figcaption.name,
    TableOfContentsNode.name,
    Audio.name,
    TextToImage.name,
    Bilibili.name,
    Chart.name,
    Table.name,
    TableCell.name,
    TableHeader.name,
    TableRow.name,
    Countdown.name,
    'inlineMath',
    'blockMath',
  ];

  return customNodes.some((type) => editor.isActive(type)) || isTableGripSelected(node);
}
