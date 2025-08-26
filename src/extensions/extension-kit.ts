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
  // Image,
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
  // Image,
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

        try {
          // 先显示 base64 预览
          const base64Url = await readFileAsDataURL(file);

          // 插入预览图片
          currentEditor
            .chain()
            .deleteRange({ from: pos ?? 0, to: pos ?? 0 })
            .setImageBlock({ src: base64Url })
            .focus()
            .run();

          // 后台上传文件
          const serverUrl = await uploadService.uploadImage(file);

          // 查找并更新图片节点
          const targetPos = findImageNodeByUrl(currentEditor.state, base64Url);

          if (targetPos !== null) {
            updateImageNode(currentEditor, targetPos, serverUrl);
          }
        } catch (error) {
          console.error('图片处理失败:', error);
          // 可以在这里添加用户友好的错误提示
        }
      });

      // 辅助函数：将文件读取为 DataURL
      function readFileAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };

          reader.onerror = () => {
            reject(new Error('文件读取失败'));
          };

          reader.readAsDataURL(file);
        });
      }

      // 辅助函数：查找图片节点
      function findImageNodeByUrl(state: any, url: string): number | null {
        let targetPos: number | null = null;

        state.doc.descendants((node: any, pos: number) => {
          if (node.type.name === 'imageBlock' && node.attrs.src === url) {
            targetPos = pos;

            return false; // 停止遍历
          }
        });

        return targetPos;
      }

      // 辅助函数：更新图片节点
      function updateImageNode(editor: any, pos: number, newSrc: string): void {
        editor
          .chain()
          .command(({ tr }: { tr: any }) => {
            tr.setNodeMarkup(pos, undefined, { src: newSrc });

            return true;
          })
          .focus()
          .run();
      }
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
