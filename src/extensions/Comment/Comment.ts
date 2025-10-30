import { Mark, mergeAttributes, Range } from '@tiptap/core';
import { Mark as PMMark } from '@tiptap/pm/model';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment (add)
       */
      setComment: (commentId: string, markText?: string) => ReturnType;
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
        getAttrs: (el) => !!(el as HTMLSpanElement).getAttribute('data-comment-id')?.trim() && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  onSelectionUpdate() {
    const { $from } = this.editor.state.selection;

    const marks = $from.marks();

    if (!marks.length) {
      this.storage.activeCommentId = null;
      this.options.onCommentActivated(this?.storage.activeCommentId || '');

      return;
    }

    const commentMark = this.editor.schema.marks.comment;

    const activeCommentMark = marks.find((mark) => mark.type === commentMark);

    this.storage.activeCommentId = activeCommentMark?.attrs.commentId || null;

    this.options.onCommentActivated(this?.storage.activeCommentId || '');
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
        ({ commands }) => {
          if (!commentId) return false;
          console.log('setComment', commentId, markText);

          return commands.setMark('comment', { commentId, markText });
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
