import { Editor } from '@tiptap/core';
import { JSONContent } from '@tiptap/core';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import type { Schema } from '@tiptap/pm/model';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Fragment } from '@tiptap/pm/model';

import { ExtensionKit } from '@/extensions/extension-kit';

/**
 * 将 Markdown 字符串转换为 Tiptap JSON 格式
 * 使用临时 Editor 实例来完成转换
 */
export async function markdownToTiptapJSON(markdown: string): Promise<JSONContent> {
  if (!markdown || markdown.trim() === '') {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  return new Promise((resolve, reject) => {
    let editorInstance: Editor | null = null;

    try {
      editorInstance = new Editor({
        content: '',
        extensions: ExtensionKit({ provider: null }),
        editorProps: {
          attributes: {
            class: 'hidden',
          },
        },
        onCreate: ({ editor }) => {
          try {
            // 解析 Markdown 为 MDAST
            const tree = fromMarkdown(markdown, {
              extensions: [gfm()],
              mdastExtensions: [gfmFromMarkdown()],
            });

            // 转换为 ProseMirror 节点
            const nodes = mdastToProseMirror(tree, editor.schema);

            // 构建 Tiptap JSON
            const json: JSONContent = {
              type: 'doc',
              content: nodes.map((node) => nodeToJSON(node)),
            };

            editor.destroy();
            resolve(json);
          } catch (error) {
            editor.destroy();
            reject(error);
          }
        },
      });
    } catch (error) {
      if (editorInstance) {
        editorInstance.destroy();
      }

      reject(error);
    }
  });
}

/**
 * 将 MDAST 树转换为 ProseMirror 节点数组
 */
function mdastToProseMirror(node: any, schema: Schema): ProseMirrorNode[] {
  if (!node || !node.children) return [];

  return node.children
    .map((child: any) => mdastNodeToPM(child, schema))
    .flat()
    .filter(Boolean);
}

/**
 * 将单个 MDAST 节点转换为 ProseMirror 节点
 */
function mdastNodeToPM(node: any, schema: Schema): ProseMirrorNode | ProseMirrorNode[] | null {
  switch (node.type) {
    case 'paragraph': {
      const nodes: ProseMirrorNode[] = [];
      let inlineNodes: any[] = [];

      for (const child of node.children || []) {
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
      }

      return nodes;
    }

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

      const paragraph = schema.nodes.paragraph;
      if (!paragraph) return null;

      const rows = (node.children || []).map((row: any, rowIdx: number) => {
        const rawCells = row.children || [];
        const cells = rawCells.map((cell: any) => {
          const raw =
            cell.children && cell.children.length > 0
              ? cell.children
              : cell.value != null
                ? [{ type: 'text', value: String(cell.value) }]
                : [];
          const inlineContent = mdastInlineToPM(raw, schema);
          const cellType = rowIdx === 0 ? 'tableHeader' : 'tableCell';
          const CellType = schema.nodes[cellType];

          if (inlineContent.length === 0) {
            const filled = CellType.createAndFill();

            return filled ?? CellType.create(null, Fragment.from([paragraph.create()]));
          }

          const paraContent = Fragment.from(inlineContent);
          const block = paragraph.create(null, paraContent);

          return CellType.create(null, Fragment.from([block]));
        });

        return schema.nodes.tableRow.create(null, cells);
      });

      return schema.nodes.table.create(null, rows);
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

/**
 * 将 inline MDAST 节点转换为 ProseMirror 节点
 */
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

/**
 * 给节点添加标记
 */
function addMark(node: ProseMirrorNode, mark: any): ProseMirrorNode {
  if (node.isText) {
    return node.type.schema.text(node.text || '', node.marks.concat([mark]));
  }

  return node.type.create(node.attrs, node.content, node.marks.concat([mark]));
}

/**
 * 将 ProseMirror 节点转换为 JSON
 */
function nodeToJSON(node: ProseMirrorNode): JSONContent {
  const json: JSONContent = {
    type: node.type.name,
  };

  if (Object.keys(node.attrs).length > 0) {
    json.attrs = node.attrs;
  }

  if (node.marks && node.marks.length > 0) {
    json.marks = node.marks.map((mark) => ({
      type: mark.type.name,
      attrs: mark.attrs,
    }));
  }

  if (node.isText && node.text) {
    json.text = node.text;
  }

  if (node.content && node.content.size > 0) {
    json.content = [];
    node.content.forEach((child) => {
      json.content!.push(nodeToJSON(child));
    });
  }

  return json;
}
