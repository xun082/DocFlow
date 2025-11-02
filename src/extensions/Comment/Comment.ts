import { Mark, mergeAttributes, Range } from '@tiptap/core';
import { Mark as PMMark } from '@tiptap/pm/model';
import { v4 as uuid } from 'uuid';
import { debounce } from 'lodash-es';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment (add)
       */
      setComment: (commentId: string | null, markText?: string) => ReturnType;
      /**
       * Unset a comment (remove)
       */
      unsetComment: (commentId: string) => ReturnType;
    };
  }
}

export interface MarkWithRange {
  mark: PMMark;
  range: Range;
}

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
  onCommentActivated: (commentId: string) => void;
}

export interface CommentStorage {
  activeCommentId: string | null;
}

export const Comment = Mark.create<CommentOptions, CommentStorage>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentActivated: () => {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute('data-comment-id'),
        renderHTML: (attrs) => ({ 'data-comment-id': attrs.commentId }),
      },
      markText: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute('data-mark-text'),
        renderHTML: (attrs) => ({ 'data-mark-text': attrs.markText }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
        getAttrs: (el) => {
          const commentId = (el as HTMLSpanElement).getAttribute('data-comment-id');

          if (commentId?.trim()) {
            return {
              commentId: commentId.trim(),
              markText: (el as HTMLSpanElement).getAttribute('data-mark-text') || null,
            };
          }

          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  onSelectionUpdate() {
    const { selection } = this.editor.state;
    const { $from } = this.editor.state.selection;

    // 如果是选取模式，可能是想增加评论
    if (!selection.empty) return;

    const marks = $from.marks();

    if (marks.length > 0) {
      const commentMark = this.editor.schema.marks.comment;
      // 返回第一个返回的mark
      const activeCommentMark = marks.find((mark) => mark.type === commentMark);

      this.storage.activeCommentId = activeCommentMark?.attrs.commentId || null;

      // 使用防抖函数包装回调，避免频繁触发，避免选择和光标同时触发，导致体验不好
      const debouncedOnCommentActivated = debounce(
        (commentId: string) => {
          this.options.onCommentActivated(commentId);
        },
        300, // 300ms 延迟
        { trailing: true },
      );

      debouncedOnCommentActivated(this?.storage.activeCommentId || '');
    }
  },

  addStorage() {
    return {
      activeCommentId: null,
    };
  },

  addCommands() {
    return {
      setComment:
        (commentId, markText = '') =>
        ({ editor, commands, tr, dispatch }) => {
          const { selection } = editor.state;
          const prev = editor.getAttributes('comment');
          const oldCommentId = prev.commentId;

          // 场景一：选区模式 - 创建新评论或更新现有评论
          if (!selection.empty) {
            const newAttrs = {
              commentId: uuid(),
              markText: markText || null,
            };

            // 使用正确的命令语法设置 mark
            return commands.setMark('comment', newAttrs);
          }

          // 场景二：光标模式 - 更新现有评论
          if (selection.empty && oldCommentId) {
            const finalCommentId = commentId || oldCommentId;
            if (!finalCommentId) return false;

            const newAttrs = {
              commentId: finalCommentId,
              markText: markText || null,
            };

            const commentMarkType = editor.schema.marks.comment;
            let markApplied = false;

            tr.doc.descendants((node, pos) => {
              if (!node.isInline) return;

              const mark = node.marks.find(
                (m) => m.type === commentMarkType && m.attrs.commentId === oldCommentId,
              );

              if (mark) {
                const from = pos;
                const to = pos + node.nodeSize;
                tr.removeMark(from, to, mark); // 移除精确的 mark 实例
                tr.addMark(from, to, commentMarkType.create(newAttrs));
                markApplied = true;
              }
            });

            if (markApplied && dispatch) {
              dispatch(tr);

              return true;
            }
          }

          return false;
        },
      unsetComment:
        (commentId) =>
        ({ tr, dispatch }) => {
          if (!commentId) return false;

          const commentMarksWithRange: MarkWithRange[] = [];

          tr.doc.descendants((node, pos) => {
            const commentMark = node.marks.find(
              (mark) => mark.type.name === 'comment' && mark.attrs.commentId === commentId,
            );

            if (!commentMark) return;

            commentMarksWithRange.push({
              mark: commentMark,
              range: {
                from: pos,
                to: pos + node.nodeSize,
              },
            });
          });

          commentMarksWithRange.forEach(({ mark, range }) => {
            tr.removeMark(range.from, range.to, mark);
          });

          return dispatch?.(tr);
        },
    };
  },

  // TipTap 3.x 新增：添加键盘快捷键支持
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => {
        // 快捷键：Cmd/Ctrl+Shift+M 用于快速添加评论
        return false; // 返回 false 表示不阻止默认行为
      },
    };
  },

  // TipTap 3.x 新增：添加输入规则支持
  addInputRules() {
    return [];
  },

  // TipTap 3.x 新增：添加粘贴规则支持
  addPasteRules() {
    return [];
  },
});
