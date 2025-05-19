import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model';

/**
 * 检查节点类型是否匹配
 */
function nodeEqualsType({
  types,
  node,
}: {
  types: NodeType | NodeType[];
  node: ProseMirrorNode;
}): boolean {
  return Array.isArray(types) ? types.includes(node.type) : node.type === types;
}

/**
 * Extension based on:
 * - https://github.com/ueberdosis/tiptap/blob/v1/packages/tiptap-extensions/src/extensions/TrailingNode.js
 * - https://github.com/remirror/remirror/blob/e0f1bec4a1e8073ce8f5500d62193e52321155b9/packages/prosemirror-trailing-node/src/trailing-node-plugin.ts
 */

export interface TrailingNodeOptions {
  /**
   * 要添加的尾随节点类型
   */
  node: string;
  /**
   * 不在这些节点后添加尾随节点
   */
  notAfter: string[];
}

/**
 * TrailingNode 扩展
 *
 * 确保文档末尾总是有指定的节点类型，除非最后一个节点是特定类型
 */
export const TrailingNode = Extension.create<TrailingNodeOptions>({
  name: 'trailingNode',

  addOptions() {
    return {
      node: 'paragraph',
      notAfter: ['paragraph'],
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey<boolean>(this.name);

    // 获取所有禁用的节点类型
    const disabledNodeTypes = Object.values(this.editor.schema.nodes).filter((node) =>
      this.options.notAfter.includes(node.name),
    );

    return [
      new Plugin({
        key: pluginKey,

        appendTransaction: (_, __, state) => {
          const { doc, tr, schema } = state;
          const shouldInsertNodeAtEnd = pluginKey.getState(state);

          // 如果不需要插入节点，直接返回
          if (!shouldInsertNodeAtEnd) {
            return null;
          }

          const endPosition = doc.content.size;
          const nodeType = schema.nodes[this.options.node];

          if (!nodeType) {
            console.warn(`Node type "${this.options.node}" not found in schema`);

            return null;
          }

          return tr.insert(endPosition, nodeType.create());
        },

        state: {
          init: (_, state) => {
            const lastNode = state.tr.doc.lastChild;

            if (!lastNode) {
              return true;
            }

            return !nodeEqualsType({
              node: lastNode,
              types: disabledNodeTypes,
            });
          },

          apply: (tr, value) => {
            // 如果文档没有变化，保持当前状态
            if (!tr.docChanged) {
              return value;
            }

            const lastNode = tr.doc.lastChild;

            if (!lastNode) {
              return true;
            }

            return !nodeEqualsType({
              node: lastNode,
              types: disabledNodeTypes,
            });
          },
        },
      }),
    ];
  },
});
