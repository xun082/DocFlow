'use client';

import { mergeAttributes, Node } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { ReactNodeViewRenderer } from '@tiptap/react';

import MentionComponent from './components/MentionComponent';

export interface MentionOptions {
  HTMLAttributes: Record<string, any>;
  renderText: (props: { options: MentionOptions; node: ProseMirrorNode }) => string;
  renderHTML: (props: { options: MentionOptions; node: ProseMirrorNode }) => any;
  suggestion: Omit<SuggestionOptions, 'editor'>;
}

export const MentionPluginKey = new PluginKey('mention');

export const Mention = Node.create<MentionOptions>({
  name: 'mention',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'mention',
      },
      renderText({ node }) {
        return `${node.attrs.label ?? node.attrs.id}`;
      },
      renderHTML({ options, node }) {
        return [
          'span',
          mergeAttributes(options.HTMLAttributes),
          `${node.attrs.label ?? node.attrs.id}`,
        ];
      },
      suggestion: {
        char: '@',
        pluginKey: MentionPluginKey,
        command: ({ editor, range, props }) => {
          // increase range.to by one when the next node is of type "text"
          // and starts with a space character
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(' ');

          if (overrideSpace) {
            range.to += 1;
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: this.name,
                attrs: props,
              },
              {
                type: 'text',
                text: ' ',
              },
            ])
            .run();

          window.getSelection()?.collapseToEnd();
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const type = state.schema.nodes[this.name];
          const allow = !!$from.parent.type.contentMatch.matchType(type);

          return allow;
        },
      },
    };
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },

      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }

          return {
            'data-label': attributes.label,
          };
        },
      },

      email: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-email'),
        renderHTML: (attributes) => {
          if (!attributes.email) {
            return {};
          }

          return {
            'data-email': attributes.email,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    if (this.options.renderHTML) {
      return this.options.renderHTML({
        options: this.options,
        node,
      });
    }

    return [
      'span',
      mergeAttributes({ 'data-type': this.name }, this.options.HTMLAttributes, HTMLAttributes),
      this.options.renderText({
        options: this.options,
        node,
      }),
    ];
  },

  renderText({ node }) {
    if (this.options.renderText) {
      return this.options.renderText({
        options: this.options,
        node,
      });
    }

    return `${node.attrs.label ?? node.attrs.id}`;
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true;
              tr.insertText(this.options.suggestion.char || '', pos, pos + node.nodeSize);

              return false;
            }
          });

          return isMention;
        }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MentionComponent);
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default Mention;
