// 简化的服务端扩展配置 - 只保留渲染必需的核心扩展
import StarterKit from '@tiptap/starter-kit';
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

// 从项目导入必要的自定义扩展
import { Document } from './Document';
import { HorizontalRule } from './HorizontalRule/HorizontalRule';
import { FontSize } from './FontSize';
import { Table, TableRow, TableHeader, TableCell } from './Table';
import { Columns, Column } from './MultiColumn';
import { ImageBlock } from './ImageBlock';
import { TrailingNode } from './TrailingNode';

export const ExtensionKitServer = () => [
  // 核心文档 - 使用与客户端相同的自定义 Document 扩展
  Document,

  // StarterKit - 禁用冲突的扩展，使用自定义版本
  StarterKit.configure({
    document: false,
    heading: false,
    paragraph: false, // 我们单独配置段落
    horizontalRule: false, // 禁用 StarterKit 的 horizontalRule，使用自定义版本
    // 保留其他默认配置，包括 HardBreak 来处理换行
  }),

  // 段落 - 使用简单配置，依赖CSS样式处理间距
  Paragraph,

  // 水平分割线 - 使用自定义版本避免重复
  HorizontalRule,

  // 标题
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),

  // Typography - 重要！确保空格和文本格式正确，但禁用可能影响换行的转换
  Typography.configure({
    // 禁用一些自动转换，避免影响换行
    openDoubleQuote: false,
    closeDoubleQuote: false,
    openSingleQuote: false,
    closeSingleQuote: false,
    // 保留其他有用的功能
  }),

  // 文本样式
  TextStyle,
  FontSize,
  FontFamily,
  Color,
  Underline,

  // 文本对齐
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),

  // 高亮和上下标
  Highlight.configure({ multicolor: true }),
  Subscript,
  Superscript,

  // 链接
  Link.configure({
    openOnClick: false,
  }),

  // 任务列表
  TaskList,
  TaskItem.configure({
    nested: true,
  }),

  // 图片 - 使用项目中的ImageBlock，已经有SSR兼容性处理
  Image,
  ImageBlock,

  // 表格
  Table,
  TableRow,
  TableHeader,
  TableCell,

  // 列布局 - 使用项目中的MultiColumn扩展
  Columns,
  Column,

  // TrailingNode - 确保文档末尾正确处理
  TrailingNode,
];

export default ExtensionKitServer;
