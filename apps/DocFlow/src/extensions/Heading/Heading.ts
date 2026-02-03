import { mergeAttributes } from '@tiptap/core';
import TiptapHeading from '@tiptap/extension-heading';
import type { Level } from '@tiptap/extension-heading';

export const Heading = TiptapHeading.extend({
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: true,
        parseHTML: (element) => {
          const level = element.tagName.toLowerCase().replace('h', '');

          return parseInt(level, 10);
        },
        renderHTML: () => {
          return {};
        },
      },
    };
  },

  parseHTML() {
    return this.options.levels.map((level: Level) => ({
      tag: `h${level}`,
      attrs: { level },
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    const nodeLevel = parseInt(node.attrs.level, 10) as Level;
    const hasLevel = this.options.levels.includes(nodeLevel);
    const level = hasLevel ? nodeLevel : this.options.levels[0];

    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

export default Heading;
