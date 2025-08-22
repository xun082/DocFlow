'use client';

import { HocuspocusProvider } from '@hocuspocus/provider';
import { isChangeOrigin } from '@tiptap/extension-collaboration';
import { Mathematics } from '@tiptap/extension-mathematics';

import {
  BlockquoteFigure,
  CharacterCount,
  CodeBlock,
  Color,
  Details,
  DetailsContent,
  DetailsSummary,
  Document,
  HardBreak,
  Paragraph,
  Text,
  Image,
  Dropcursor,
  Emoji,
  Figcaption,
  Focus,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalRule,
  ImageBlock,
  Link,
  MarkdownPaste,
  Placeholder,
  Selection,
  SlashCommand,
  StarterKit,
  Subscript,
  Superscript,
  Table,
  TableOfContents,
  TableCell,
  TableHeader,
  TableRow,
  TextAlign,
  TextStyle,
  TrailingNode,
  Typography,
  Underline,
  emojiSuggestion,
  Columns,
  Column,
  TaskItem,
  TaskList,
  UniqueID,
  DraggableBlock,
  DragHandler,
  Audio,
  FileHandler,
} from '.';
import { ImageUpload } from './ImageUpload';
import { TableOfContentsNode } from './TableOfContentsNode';
import { ExcalidrawImage } from './ExcalidrawImage';
import { SelectOnlyCode } from './CodeBlock/SelectOnlyCode';

import uploadService from '@/services/upload';

export interface ExtensionKitProps {
  provider: HocuspocusProvider | null;
}

export const ExtensionKit = ({ provider }: ExtensionKitProps) => [
  Document,
  HardBreak,
  Paragraph,
  Text,
  Image,
  Columns,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Column,
  Selection,
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  HorizontalRule,
  UniqueID.configure({
    types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'table'],
    filterTransaction: (transaction) => !isChangeOrigin(transaction),
  }),
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    undoRedo: false,
    codeBlock: false,
    paragraph: false,
    hardBreak: false,
    text: false,
    link: false,
    underline: false,
    trailingNode: false,
  } as any),
  Details.configure({
    persist: true,
    HTMLAttributes: {
      class: 'details',
    },
  }),
  DetailsContent,
  DetailsSummary,
  CodeBlock,
  TextStyle,
  FontSize,
  FontFamily,
  Color,
  TrailingNode,
  Link.configure({
    openOnClick: false,
  }),
  Highlight.configure({ multicolor: true }),
  Underline,
  CharacterCount.configure({ limit: 50000 }),
  TableOfContents,
  TableOfContentsNode,
  ImageUpload.configure({
    clientId: provider?.document?.clientID,
  }),
  ImageBlock,
  ExcalidrawImage,
  DraggableBlock,
  DragHandler,
  FileHandler.configure({
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    onDrop: (currentEditor, files, pos) => {
      files.forEach(async (file) => {
        const url = await uploadService.uploadImage(file);

        currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run();
      });
    },
    onPaste: (currentEditor, files) => {
      files.forEach(async (file) => {
        const pos = currentEditor.state.selection.anchor;
        // 先显示 base64 预览
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64Url = e.target?.result as string;

          // 插入 base64 图片作为预览
          currentEditor.chain().setImageBlockAt({ pos, src: base64Url }).focus().run();

          try {
            // 后台上传文件
            const serverUrl = await uploadService.uploadImage(file);

            // 遍历文档找到具有该base64 URL的图片节点并更新
            const { state } = currentEditor;
            let targetPos = null;

            state.doc.descendants((node, pos) => {
              if (node.type.name === 'imageBlock' && node.attrs.src === base64Url) {
                targetPos = pos;

                return false; // 停止遍历
              }
            });

            if (targetPos !== null) {
              currentEditor
                .chain()
                .setNodeSelection(targetPos)
                .updateAttributes('imageBlock', { src: serverUrl })
                .focus()
                .run();
            }
          } catch (error) {
            console.error('图片上传失败:', error);
            // 上传失败时保持 base64 预览
          }
        };

        reader.onerror = () => {
          console.error('文件读取失败');
        };

        reader.readAsDataURL(file);
      });
    },
  }),

  Emoji.configure({
    enableEmoticons: true,
    suggestion: emojiSuggestion,
  }),
  TextAlign.extend({
    addKeyboardShortcuts() {
      return {
        Tab: () => {
          return this.editor.commands.insertContent('  ');
        },
        'Shift-Tab': () => {
          const { state } = this.editor;
          const { from } = state.selection;
          const $from = state.doc.resolve(from);
          const startOfLine = $from.start($from.depth);
          const textBeforeCursor = state.doc.textBetween(startOfLine, from);

          if (textBeforeCursor.endsWith('  ')) {
            const deleteFrom = Math.max(startOfLine, from - 2);

            return this.editor.commands.deleteRange({ from: deleteFrom, to: from });
          } else if (textBeforeCursor.endsWith(' ')) {
            return this.editor.commands.deleteRange({ from: from - 1, to: from });
          }

          return false;
        },
      };
    },
  }).configure({
    types: ['heading', 'paragraph'],
  }),
  Subscript,
  Superscript,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Typography,
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: false,
    placeholder: () => '',
  }),
  SlashCommand,
  Focus,
  Figcaption,
  BlockquoteFigure,
  Dropcursor.configure({
    width: 2,
    class: 'ProseMirror-dropcursor border-black',
  }),
  MarkdownPaste,
  SelectOnlyCode,
  Audio,
  Mathematics.configure({
    katexOptions: {
      throwOnError: false,
      displayMode: false,
      output: 'html',
      trust: false,
    },
  }),
];

export default ExtensionKit;
