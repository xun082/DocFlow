import type { Node } from '@tiptap/pm/model';

/**
 * 根据 ProseMirror 文档和选区位置计算选中文本的起止行号（按块节点计数）。
 */
export function getSelectionLineRange(
  doc: Node,
  from: number,
  to: number,
): { startLine: number; endLine: number } {
  let startLine = 1;
  let endLine = 1;
  let pos = 0;

  doc.descendants((node) => {
    if (pos >= to) return false;

    if (node.isBlock) {
      if (pos < from) startLine++;
      if (pos < to) endLine++;
    }

    pos += node.nodeSize;

    return true;
  });

  return { startLine, endLine };
}
