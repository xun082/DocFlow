import { Editor } from '@tiptap/react';

import {
  Figcaption,
  HorizontalRule,
  ImageBlock,
  ImageUpload,
  Link,
  CodeBlock,
  Audio,
  AI,
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

export const isTableGripSelected = (node: HTMLElement) => {
  let container = node;

  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement!;
  }

  const gripColumn =
    container && container.querySelector && container.querySelector('a.grip-column.selected');
  const gripRow =
    container && container.querySelector && container.querySelector('a.grip-row.selected');

  if (gripColumn || gripRow) {
    return true;
  }

  return false;
};

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
  const customNodes = [
    HorizontalRule.name,
    ImageBlock.name,
    ImageUpload.name,
    CodeBlock.name,
    ImageBlock.name,
    Link.name,
    Figcaption.name,
    TableOfContentsNode.name,
    Audio.name,
    AI.name,
    TextToImage.name,
    Bilibili.name,
    Chart.name,
    Table.name,
    TableCell.name,
    TableHeader.name,
    TableRow.name,
    Countdown.name,
    'inlineMath', // 行内数学公式
    'blockMath', // 块级数学公式
  ];

  return customNodes.some((type) => editor.isActive(type)) || isTableGripSelected(node);
};

export default isCustomNodeSelected;
