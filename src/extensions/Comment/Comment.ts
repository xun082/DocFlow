import { Mark, mergeAttributes, Range } from '@tiptap/core';
import { Mark as PMMark } from '@tiptap/pm/model';
import { v4 as uuid } from 'uuid';
import { debounce } from 'lodash-es';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * 添加评论标记
       */
      setComment: (commentId?: string) => ReturnType;
      /**
       * 移除评论标记
       */
      unsetComment: (commentId: string) => ReturnType;
    };
  }
}

export interface MarkWithRange {
  mark: PMMark;
  range: Range;
}

export interface CommentInfo {
  commentId: string;
  from: number;
  to: number;
  text: string;
}

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
  onCommentActivated: (commentId: string | null) => void;
  onCommentClick: (commentId: string) => void;
}

export interface CommentStorage {
  activeCommentId: string | null;
  hoveredCommentId: string | null;
}

export const Comment = Mark.create<CommentOptions, CommentStorage>({
  name: 'comment',

  // 关键：允许多个评论标记重叠
  inclusive: false,
  excludes: '', // 空字符串表示不排斥任何标记，允许重叠

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentActivated: () => {},
      onCommentClick: () => {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute('data-comment-id'),
        renderHTML: (attrs) => ({ 'data-comment-id': attrs.commentId }),
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
            };
          }

          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-comment': 'true',
      }),
      0,
    ];
  },

  onSelectionUpdate() {
    const { selection } = this.editor.state;
    const { $from } = selection;

    // 只有在光标模式（选区为空）时才执行评论标记检测
    if (selection.empty) {
      const marks = $from.marks();
      const commentMark = this.editor.schema.marks.comment;

      // 获取所有评论标记
      const commentMarks = marks.filter((mark) => mark.type === commentMark);

      if (commentMarks.length > 0) {
        // 如果有多个评论，选择最后一个（最内层的）
        const activeCommentMark = commentMarks[commentMarks.length - 1];
        const commentId = activeCommentMark.attrs.commentId;

        if (this.storage.activeCommentId !== commentId) {
          this.storage.activeCommentId = commentId || null;

          // 使用防抖函数包装回调，避免频繁触发
          const debouncedOnCommentActivated = debounce(
            (id: string) => {
              this.options.onCommentActivated(id);
            },
            300,
            { trailing: true, leading: false },
          );

          debouncedOnCommentActivated(commentId || '');
        }
      } else {
        // 如果没有评论标记，清空 activeCommentId
        if (this.storage.activeCommentId !== null) {
          this.storage.activeCommentId = null;
          this.options.onCommentActivated(null);
        }
      }
    } else {
      // 如果是选取模式，清空 activeCommentId
      if (this.storage.activeCommentId !== null) {
        this.storage.activeCommentId = null;
      }
    }
  },

  addStorage() {
    return {
      activeCommentId: null,
      hoveredCommentId: null,
    };
  },

  addCommands() {
    return {
      // 添加评论标记
      setComment:
        (commentId) =>
        ({ commands, state }) => {
          const { selection } = state;

          // 必须有选区才能添加评论
          if (selection.empty) {
            return false;
          }

          const newCommentId = commentId || uuid();

          // 添加评论标记
          return commands.setMark('comment', { commentId: newCommentId });
        },

      // 移除评论标记
      unsetComment:
        (commentId) =>
        ({ tr, dispatch, state }) => {
          if (!commentId) {
            return false;
          }

          const commentMarksWithRange: MarkWithRange[] = [];
          const commentMarkType = state.schema.marks.comment;

          // 收集所有匹配的评论标记
          tr.doc.descendants((node, pos) => {
            const commentMark = node.marks.find(
              (mark) => mark.type === commentMarkType && mark.attrs.commentId === commentId,
            );

            if (commentMark) {
              commentMarksWithRange.push({
                mark: commentMark,
                range: {
                  from: pos,
                  to: pos + node.nodeSize,
                },
              });
            }
          });

          // 移除所有匹配的标记
          commentMarksWithRange.forEach(({ mark, range }) => {
            tr.removeMark(range.from, range.to, mark);
          });

          if (dispatch && commentMarksWithRange.length > 0) {
            dispatch(tr);

            return true;
          }

          return false;
        },
    };
  },

  // 添加键盘快捷键支持
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => {
        // 快捷键：Cmd/Ctrl+Shift+M 用于快速添加评论
        // 这里只是占位符，实际逻辑在外部处理
        return false;
      },
    };
  },

  // 添加输入规则支持
  addInputRules() {
    return [];
  },

  // 添加粘贴规则支持
  addPasteRules() {
    return [];
  },

  // 添加 DOM 事件处理
  onTransaction({ editor, transaction }) {
    // 当文档更新时，检查是否需要更新激活的评论
    if (transaction.docChanged || transaction.selectionSet) {
      const { selection } = editor.state;

      if (selection.empty) {
        const marks = selection.$from.marks();
        const commentMarks = marks.filter((mark) => mark.type.name === 'comment');

        if (commentMarks.length > 0) {
          const activeCommentMark = commentMarks[commentMarks.length - 1];
          this.storage.activeCommentId = activeCommentMark.attrs.commentId || null;
        } else {
          this.storage.activeCommentId = null;
        }
      }
    }
  },

  // 添加 DOM 事件监听（点击评论标记）
  onCreate() {
    // 在编辑器创建后添加点击事件监听
    if (typeof window !== 'undefined') {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const commentSpan = target.closest('span[data-comment="true"]');

        if (commentSpan) {
          const commentId = commentSpan.getAttribute('data-comment-id');

          if (commentId) {
            // 触发点击回调
            this.options.onCommentClick(commentId);
          }
        }
      };

      this.editor.view.dom.addEventListener('click', handleClick);

      // 保存清理函数
      this.editor.on('destroy', () => {
        this.editor.view.dom.removeEventListener('click', handleClick);
      });
    }
  },
});

// 导出实用函数：获取所有评论标记
export function getAllComments(editor: any): CommentInfo[] {
  const comments: CommentInfo[] = [];
  const commentMarkType = editor.schema.marks.comment;
  const seen = new Set<string>();

  if (!commentMarkType) {
    return comments;
  }

  editor.state.doc.descendants((node: any, pos: number) => {
    node.marks.forEach((mark: any) => {
      if (mark.type === commentMarkType && mark.attrs.commentId) {
        const commentId = mark.attrs.commentId;

        // 避免重复
        if (!seen.has(commentId)) {
          seen.add(commentId);

          // 找到这个评论的完整范围
          let from = pos;
          let to = pos + node.nodeSize;
          let text = node.text || '';

          // 查找相同 commentId 的所有节点
          editor.state.doc.descendants((n: any, p: number) => {
            if (
              n.marks.some(
                (m: any) => m.type === commentMarkType && m.attrs.commentId === commentId,
              )
            ) {
              from = Math.min(from, p);
              to = Math.max(to, p + n.nodeSize);

              if (n.text) {
                text = editor.state.doc.textBetween(from, to);
              }
            }
          });

          comments.push({ commentId, from, to, text });
        }
      }
    });
  });

  return comments;
}
