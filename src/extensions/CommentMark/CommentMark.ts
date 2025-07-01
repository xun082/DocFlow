import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface CommentMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentMark: {
      /**
       * Set a comment mark
       */
      setCommentMark: (attributes?: { commentId: string }) => ReturnType;
      /**
       * Toggle a comment mark
       */
      toggleCommentMark: (attributes?: { commentId: string }) => ReturnType;
      /**
       * Unset a comment mark
       */
      unsetCommentMark: () => ReturnType;
    };
  }
}

export const CommentMark = Mark.create<CommentMarkOptions>({
  name: 'commentMark',

  // 关键：设置为不包含新输入的内容
  inclusive: false,

  // 确保标记不会向两边扩展
  excludes: '',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) => {
          if (!attributes.commentId) {
            return {};
          }

          return {
            'data-comment-id': attributes.commentId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'comment-mark',
        title: '点击查看评论',
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('commentMark-click'),
        props: {
          handleClick: (view: any, pos: number, event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // 查找最近的评论标记元素
            const commentElement = target.closest('.comment-mark');

            if (commentElement) {
              const commentId = commentElement.getAttribute('data-comment-id');

              if (commentId) {
                // 获取评论标记的文本内容
                const commentText = commentElement.textContent || '';

                // 触发自定义事件，传递评论ID和文本内容
                const customEvent = new CustomEvent('commentMarkClicked', {
                  detail: {
                    commentId,
                    selectedText: commentText,
                  },
                  bubbles: true,
                  cancelable: true,
                });

                document.dispatchEvent(customEvent);

                // 返回 true 阻止 ProseMirror 的默认点击行为
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setCommentMark:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleCommentMark:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetCommentMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
