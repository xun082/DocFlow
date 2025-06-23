import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
  onCommentMarkClicked: (commentId: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Sets a comment mark
       */
      setCommentMark: (attributes: { commentId: string }) => ReturnType;
      /**
       * Toggles a comment mark
       */
      toggleCommentMark: (attributes: { commentId: string }) => ReturnType;
      /**
       * Unsets a comment mark
       */
      unsetCommentMark: () => ReturnType;
    };
  }
}

export const Comment = Mark.create<CommentOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentMarkClicked: () => {},
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
        tag: 'mark[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'comment-highlight' }),
      0,
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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('handleClickComment'),
        props: {
          handleDOMEvents: {
            click: (view, event: MouseEvent) => {
              const target = event.target as HTMLElement;
              const commentId = target.getAttribute('data-comment-id');

              if (commentId && target.classList.contains('comment-highlight')) {
                this.options.onCommentMarkClicked(commentId);

                return true;
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});

export default Comment;
