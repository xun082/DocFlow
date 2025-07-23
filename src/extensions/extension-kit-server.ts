import { mergeAttributes } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { Typography } from '@tiptap/extension-typography';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Image } from '@tiptap/extension-image';
import { FontFamily } from '@tiptap/extension-font-family';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { HardBreak } from '@tiptap/extension-hard-break';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import { Emoji } from '@tiptap-pro/extension-emoji';

import { Document } from './Document';
import { HorizontalRule } from './HorizontalRule/HorizontalRule';
import { FontSize } from './FontSize';
import { Table, TableRow, TableHeader, TableCell } from './Table';
import { Columns, Column } from './MultiColumn';
import { ImageBlock } from './ImageBlock';
import { MarkdownPaste } from './MarkdownPaste';
import { TrailingNode } from './TrailingNode';
import { BlockquoteFigure } from './BlockquoteFigure';
import { Figcaption } from './Figcaption';

const ServerSafeCodeBlock = CodeBlockLowlight.configure({
  lowlight: createLowlight(all),
  HTMLAttributes: {
    class: 'hljs',
  },
});

export const ExtensionKitServer = () => [
  Document,
  Text,
  HardBreak,

  // StarterKit - 禁用冲突的扩展，使用自定义版本
  StarterKit.configure({
    document: false,
    heading: false,
    paragraph: false, // 我们单独配置段落
    horizontalRule: false, // 禁用 StarterKit 的 horizontalRule，使用自定义版本
    blockquote: false, // 禁用默认的 blockquote，使用 BlockquoteFigure
    text: false, // 使用自定义 Text 扩展
    hardBreak: false, // 使用自定义 HardBreak 扩展
    codeBlock: false, // 禁用默认的 codeBlock，使用自定义版本
  }),

  ServerSafeCodeBlock,

  Paragraph.extend({
    renderHTML({ HTMLAttributes, node }) {
      const isEmpty = !node.textContent.trim();

      return [
        'p',
        mergeAttributes(HTMLAttributes, { class: 'leading-relaxed my-3' }),
        isEmpty ? '\u00A0' : 0,
      ];
    },
  }),
  HorizontalRule,
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  Typography.configure({
    openDoubleQuote: false,
    closeDoubleQuote: false,
    openSingleQuote: false,
    closeSingleQuote: false,
  }),
  BlockquoteFigure,
  Figcaption,
  TextStyle,
  FontSize,
  FontFamily,
  Color,
  Underline,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight.configure({ multicolor: true }),
  Subscript,
  Superscript,
  Link.configure({
    openOnClick: false,
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Image,
  ImageBlock,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  Columns,
  Column,
  TrailingNode,
  MarkdownPaste,
  Emoji,
];

export default ExtensionKitServer;
