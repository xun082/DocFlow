/**
 * AgentSuggestion — 自定义 TipTap Mark 扩展（Diff 模式）
 *
 * variant = 'added'   → 绿色高亮，表示 AI 新增的内容
 * variant = 'deleted' → 红色删除线，表示被替换的原始内容
 *
 * 接受提案（accept）：
 *   - 删除所有 deleted 标记所在的父块节点（移除原始内容）
 *   - 移除 added 标记（保留新内容，去掉高亮）
 *
 * 拒绝提案（reject）：
 *   - 删除所有 added 标记所在的父块节点（移除新内容）
 *   - 移除 deleted 标记（恢复原始内容外观）
 */
import { Mark, mergeAttributes } from '@tiptap/core';

export interface AgentSuggestionOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    agentSuggestion: {
      acceptAgentSuggestion: (suggestionId: string) => ReturnType;
      rejectAgentSuggestion: (suggestionId: string) => ReturnType;
    };
  }
}

export const AgentSuggestion = Mark.create<AgentSuggestionOptions>({
  name: 'agentSuggestion',

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-suggestion-id'),
        renderHTML: (attrs) =>
          attrs.suggestionId ? { 'data-suggestion-id': attrs.suggestionId } : {},
      },
      variant: {
        default: 'added',
        parseHTML: (el) => el.getAttribute('data-variant') ?? 'added',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant ?? 'added' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-suggestion-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const variant = (HTMLAttributes['data-variant'] as string) ?? 'added';

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `agent-suggestion agent-suggestion--${variant}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      // ── 接受：删除 deleted 块，移除 added 标记 ────────────────────────────
      acceptAgentSuggestion:
        (suggestionId: string) =>
        ({ state, dispatch, tr }) => {
          const { doc, schema } = state;

          // 记录含 deleted 标记的顶层父块位置（去重）
          const deletedBlocks = new Map<number, number>();
          // 记录含 added 标记的文本范围（用于移除 mark）
          const addedMarkRanges: Array<{ from: number; to: number }> = [];

          doc.descendants((node, pos) => {
            if (!node.isText) return;

            const mark = node.marks.find(
              (m) => m.type.name === 'agentSuggestion' && m.attrs.suggestionId === suggestionId,
            );
            if (!mark) return;

            if (mark.attrs.variant === 'deleted') {
              // 找最近的块级父节点
              const $pos = doc.resolve(pos);

              for (let d = $pos.depth; d >= 1; d--) {
                const pNode = $pos.node(d);

                if (pNode.isBlock) {
                  deletedBlocks.set($pos.before(d), $pos.after(d));
                  break;
                }
              }
            } else {
              addedMarkRanges.push({ from: pos, to: pos + node.nodeSize });
            }
          });

          let changed = false;

          // 先移除 added mark（不改变位置）
          for (const { from, to } of addedMarkRanges) {
            tr.removeMark(from, to, schema.marks.agentSuggestion);
            changed = true;
          }

          // 再从后往前删除 deleted 父块
          const sortedBlocks = [...deletedBlocks.entries()]
            .map(([from, to]) => ({ from, to }))
            .sort((a, b) => b.from - a.from);

          for (const { from, to } of sortedBlocks) {
            tr.delete(from, to);
            changed = true;
          }

          if (changed && dispatch) dispatch(tr);

          return changed;
        },

      // ── 拒绝：删除 added 块，移除 deleted 标记 ────────────────────────────
      rejectAgentSuggestion:
        (suggestionId: string) =>
        ({ state, dispatch, tr }) => {
          const { doc, schema } = state;

          const addedBlocks = new Map<number, number>();
          const deletedMarkRanges: Array<{ from: number; to: number }> = [];

          doc.descendants((node, pos) => {
            if (!node.isText) return;

            const mark = node.marks.find(
              (m) => m.type.name === 'agentSuggestion' && m.attrs.suggestionId === suggestionId,
            );
            if (!mark) return;

            if (mark.attrs.variant === 'added') {
              const $pos = doc.resolve(pos);

              for (let d = $pos.depth; d >= 1; d--) {
                const pNode = $pos.node(d);

                if (pNode.isBlock) {
                  addedBlocks.set($pos.before(d), $pos.after(d));
                  break;
                }
              }
            } else {
              deletedMarkRanges.push({ from: pos, to: pos + node.nodeSize });
            }
          });

          // 先移除 deleted mark（恢复原始内容外观）
          for (const { from, to } of deletedMarkRanges) {
            tr.removeMark(from, to, schema.marks.agentSuggestion);
          }

          // 再从后往前删除 added 父块
          const sortedBlocks = [...addedBlocks.entries()]
            .map(([from, to]) => ({ from, to }))
            .sort((a, b) => b.from - a.from);

          for (const { from, to } of sortedBlocks) {
            tr.delete(from, to);
          }

          if (dispatch) dispatch(tr);

          return true;
        },
    };
  },
});
