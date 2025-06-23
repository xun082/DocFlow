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
      // 添加点击事件处理
      new Plugin({
        key: new PluginKey('commentMark-click'),
        props: {
          handleClick: (view: any, pos: number, event: MouseEvent) => {
            // 检查点击的元素是否是评论标记
            const target = event.target as HTMLElement;

            if (target.classList.contains('comment-mark') || target.closest('.comment-mark')) {
              const commentElement = target.classList.contains('comment-mark')
                ? target
                : target.closest('.comment-mark');

              if (commentElement) {
                const commentId = commentElement.getAttribute('data-comment-id');

                if (commentId) {
                  // 触发自定义事件来通知评论被点击
                  const customEvent = new CustomEvent('commentMarkClicked', {
                    detail: { commentId },
                  });
                  document.dispatchEvent(customEvent);

                  return true;
                }
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
