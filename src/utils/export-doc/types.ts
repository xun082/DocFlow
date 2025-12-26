import { JSONContent } from '@tiptap/core';

// Re-export JSONContent for convenience
export type { JSONContent };

// Text and content node types
export interface TextNode {
  type: 'text';
  text: string;
  marks?: Array<Mark>;
}

export interface HardBreakNode {
  type: 'hardBreak';
  marks?: Array<Mark>;
}

// Mark types
export interface Mark {
  type:
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strike'
    | 'code'
    | 'textStyle'
    | 'link'
    | 'highlight'
    | 'subscript'
    | 'superscript';
  attrs?: {
    color?: string;
    href?: string;
    target?: string;
    rel?: string;
    class?: string | null;
    [key: string]: unknown;
  };
}

// Block node types
export interface DocumentNode extends JSONContent {
  type: 'doc';
  content?: Array<BlockNode>;
}

export interface ParagraphNode extends JSONContent {
  type: 'paragraph';
  content?: Array<TextNode | HardBreakNode>;
}

export interface HeadingNode extends JSONContent {
  type: 'heading';
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content?: Array<TextNode | HardBreakNode>;
}

export interface BlockquoteNode extends JSONContent {
  type: 'blockquote';
  content?: Array<ParagraphNode>;
}

export interface CodeBlockNode extends JSONContent {
  type: 'codeBlock';
  attrs?: {
    language?: string;
  };
  content?: Array<TextNode>;
}

export interface HorizontalRuleNode extends JSONContent {
  type: 'horizontalRule';
}

// List node types
export interface BulletListNode extends JSONContent {
  type: 'bulletList';
  content?: Array<ListItemNode>;
}

export interface OrderedListNode extends JSONContent {
  type: 'orderedList';
  attrs?: {
    start?: number;
    order?: number;
    type?: string | null;
  };
  content?: Array<ListItemNode>;
}

export interface TaskListNode extends JSONContent {
  type: 'taskList';
  content?: Array<TaskItemNode>;
}

export interface ListItemNode extends JSONContent {
  type: 'listItem';
  content?: Array<ParagraphNode>;
}

export interface TaskItemNode extends JSONContent {
  type: 'taskItem';
  attrs?: {
    checked?: boolean;
  };
  content?: Array<ParagraphNode>;
}

// Table node types
export interface TableNode extends JSONContent {
  type: 'table';
  content?: Array<TableRowNode>;
}

export interface TableRowNode extends JSONContent {
  type: 'tableRow';
  content?: Array<TableCellNode | TableHeaderNode>;
}

export interface TableCellNode extends JSONContent {
  type: 'tableCell';
  attrs?: {
    colspan?: number;
    rowspan?: number;
    colwidth?: number[] | null;
  };
  content?: Array<ParagraphNode>;
}

export interface TableHeaderNode extends JSONContent {
  type: 'tableHeader';
  attrs?: {
    colspan?: number;
    rowspan?: number;
    colwidth?: number[] | null;
  };
  content?: Array<ParagraphNode>;
}

// Image node type
export interface ImageNode extends JSONContent {
  type: 'image';
  attrs?: {
    src: string;
    alt?: string | null;
    title?: string | null;
    width?: number | null;
    height?: number | null;
  };
}

// Details node types
export interface DetailsNode extends JSONContent {
  type: 'details';
  content?: Array<DetailsSummaryNode | DetailsContentNode>;
}

export interface DetailsSummaryNode extends JSONContent {
  type: 'detailsSummary';
  content?: Array<TextNode | HardBreakNode>;
}

export interface DetailsContentNode extends JSONContent {
  type: 'detailsContent';
  content?: Array<BlockNode>;
}

// Generic converter types
export type TextContent = TextNode | HardBreakNode;
export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | BlockquoteNode
  | CodeBlockNode
  | HorizontalRuleNode
  | BulletListNode
  | OrderedListNode
  | TaskListNode
  | TableNode
  | ImageNode
  | DetailsNode;
