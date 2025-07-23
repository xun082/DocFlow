import { Extension, CommandProps, Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Slice } from '@tiptap/pm/model';
import { Fragment } from '@tiptap/pm/model';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import type { Node as ProseMirrorNode, Schema } from '@tiptap/pm/model';

export interface MarkdownPasteOptions {
  transformPastedText?: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    markdownPaste: {
      pasteMarkdown: (content: string) => ReturnType;
    };
  }
}

export const MarkdownPaste = Extension.create<MarkdownPasteOptions>({
  name: 'markdownPaste',

  addOptions() {
    return {
      transformPastedText: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('markdownPaste'),
        props: {
          handleDOMEvents: {
            paste: (view, event: ClipboardEvent) => {
              if (!this.options.transformPastedText) return false;

              const text = event.clipboardData?.getData('text/plain') ?? '';
              if (!text.trim()) return false;
              if (!isMarkdownContent(text)) return false;

              event.preventDefault();

              try {
                const nodes = parseMarkdownToProseMirror(text, this.editor);

                if (nodes.length > 0) {
                  const tr = view.state.tr;

                  if (nodes.length === 1) {
                    tr.replaceSelectionWith(nodes[0]);
                  } else {
                    tr.replaceSelection(new Slice(Fragment.fromArray(nodes), 0, 0));
                  }

                  view.dispatch(tr);

                  return true;
                }
              } catch (e) {
                console.error('Markdown 粘贴失败：', e);
              }

              return false;
            },
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      pasteMarkdown:
        (content: string) =>
        ({ tr, dispatch }: CommandProps) => {
          try {
            const nodes = parseMarkdownToProseMirror(content, this.editor);

            if (nodes.length > 0) {
              if (nodes.length === 1) {
                dispatch?.(tr.replaceSelectionWith(nodes[0]));
              } else {
                dispatch?.(tr.replaceSelection(new Slice(Fragment.fromArray(nodes), 0, 0)));
              }

              return true;
            }
          } catch (error) {
            console.error('粘贴 Markdown 失败:', error);
          }

          return false;
        },
    };
  },
});

function isMarkdownContent(text: string): boolean {
  const patterns = [
    /^#{1,6}\s+/,
    /^\*\*.*\*\*/,
    /^__.*__/,
    /^\*.*\*/,
    /^_.*_/,
    /^```/,
    /^`.*`/,
    /^\[.*\]\(.*\)/,
    /^!\[.*\]\(.*\)/,
    /^[-*+]\s+/,
    /^\d+\.\s+/,
    /^>\s+/,
    /^\|.*\|/,
    /^[-*_]{3,}/,
    /^- \[[ xX]\]/,
  ];

  return text.split('\n').some((line) => patterns.some((p) => p.test(line.trim())));
}

function parseMarkdownToProseMirror(md: string, editor: Editor): ProseMirrorNode[] {
  const tree = fromMarkdown(md, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  return mdastToProseMirror(tree, editor.schema);
}

function mdastToProseMirror(node: any, schema: Schema): ProseMirrorNode[] {
  if (!node || !node.children) return [];

  return node.children
    .map((child: any) => mdastNodeToPM(child, schema))
    .flat()
    .filter(Boolean);
}

function mdastNodeToPM(node: any, schema: Schema): ProseMirrorNode | ProseMirrorNode[] | null {
  switch (node.type) {
    case 'paragraph':
      const nodes: ProseMirrorNode[] = [];
      let inlineNodes: ProseMirrorNode[] = []; // 存放 inline 节点

      for (const child of node.children || []) {
        // Block Node
        if (['image'].includes(child.type)) {
          if (inlineNodes.length > 0) {
            nodes.push(schema.nodes.paragraph.create({}, mdastInlineToPM(inlineNodes, schema)));
            inlineNodes = [];
          }

          nodes.push(mdastNodeToPM(child, schema) as ProseMirrorNode);
        } else {
          inlineNodes.push(child);
        }
      }

      if (inlineNodes.length > 0) {
        nodes.push(schema.nodes.paragraph.create({}, mdastInlineToPM(inlineNodes, schema)));
        inlineNodes = [];
      }

      return nodes;

    case 'heading':
      return schema.nodes.heading.create(
        { level: Math.min(Math.max(node.depth || 1, 1), 6) },
        mdastInlineToPM(node.children || [], schema),
      );

    case 'blockquote':
      return schema.nodes.blockquote?.create({}, mdastToProseMirror(node, schema)) || null;

    case 'code':
      return schema.nodes.codeBlock.create(
        { language: node.lang || '' },
        node.value ? [schema.text(node.value)] : [],
      );

    case 'list': {
      const listType = node.ordered ? 'orderedList' : 'bulletList';
      const items = (node.children || [])
        .map((item: any) => {
          if (item.type !== 'listItem') return null;

          const listItemContent: ProseMirrorNode[] = [];

          for (const child of item.children || []) {
            const childNode = mdastNodeToPM(child, schema);

            if (Array.isArray(childNode)) {
              listItemContent.push(...childNode);
            } else if (childNode) {
              listItemContent.push(childNode);
            }
          }

          if (item.checked !== null && item.checked !== undefined && schema.nodes.taskItem) {
            return schema.nodes.taskItem.create({ checked: item.checked }, listItemContent);
          }

          return schema.nodes.listItem.create({}, listItemContent);
        })
        .filter(Boolean);

      return schema.nodes[listType]?.create({}, items) || null;
    }

    case 'thematicBreak':
      return schema.nodes.horizontalRule?.create() || null;

    case 'table': {
      if (
        !schema.nodes.table ||
        !schema.nodes.tableRow ||
        !schema.nodes.tableHeader ||
        !schema.nodes.tableCell
      )
        return null;

      const rows = node.children.map((row: any, rowIdx: number) => {
        const cells = row.children.map((cell: any) => {
          const cellContent = mdastInlineToPM(cell.children || [], schema);
          const cellType = rowIdx === 0 ? 'tableHeader' : 'tableCell';

          return schema.nodes[cellType].create(
            {},
            cellContent.length ? cellContent : [schema.nodes.paragraph.create()],
          );
        });

        return schema.nodes.tableRow.create({}, cells);
      });

      return schema.nodes.table.create({}, rows);
    }

    case 'image':
      return (
        schema.nodes.image?.create({
          src: node.url,
          alt: node.alt || '',
          title: node.title || '',
        }) || null
      );

    default: {
      if (node.value) {
        return schema.nodes.paragraph.create({}, [schema.text(node.value)]);
      }

      if (node.children) {
        const content = mdastToProseMirror(node, schema);

        if (content.length > 0) {
          return schema.nodes.paragraph.create({}, content);
        }
      }

      return null;
    }
  }
}

function mdastInlineToPM(children: any[], schema: Schema): ProseMirrorNode[] {
  const content: ProseMirrorNode[] = [];

  for (const child of children) {
    switch (child.type) {
      case 'text':
        content.push(schema.text(child.value));
        break;

      case 'strong':
        content.push(
          ...mdastInlineToPM(child.children || [], schema).map((node) =>
            addMark(node, schema.marks.bold.create()),
          ),
        );
        break;

      case 'emphasis':
        content.push(
          ...mdastInlineToPM(child.children || [], schema).map((node) =>
            addMark(node, schema.marks.italic.create()),
          ),
        );
        break;

      case 'inlineCode':
        content.push(addMark(schema.text(child.value), schema.marks.code.create()));
        break;

      case 'link':
        content.push(
          ...mdastInlineToPM(child.children || [], schema).map((node) =>
            addMark(node, schema.marks.link.create({ href: child.url, title: child.title })),
          ),
        );
        break;

      case 'delete':
        if (schema.marks.strike) {
          content.push(
            ...mdastInlineToPM(child.children || [], schema).map((node) =>
              addMark(node, schema.marks.strike.create()),
            ),
          );
        } else {
          content.push(...mdastInlineToPM(child.children || [], schema));
        }

        break;

      default:
        if (child.value) {
          content.push(schema.text(child.value));
        } else if (child.children) {
          content.push(...mdastInlineToPM(child.children, schema));
        }

        break;
    }
  }

  return content;
}

function addMark(node: ProseMirrorNode, mark: any): ProseMirrorNode {
  if (node.isText) {
    return node.type.schema.text(node.text || '', node.marks.concat([mark]));
  }

  return node.type.create(node.attrs, node.content, node.marks.concat([mark]));
}
