import { Node } from '@tiptap/core';

export enum ColumnLayout {
  SidebarLeft = 'sidebar-left',
  SidebarRight = 'sidebar-right',
  TwoColumn = 'two-column',
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: () => ReturnType;
      setLayout: (layout: ColumnLayout) => ReturnType;
      setColumnColor: (color: string) => ReturnType;
    };
  }
}

export const Columns = Node.create({
  name: 'columns',

  group: 'columns',

  content: 'column column',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      layout: {
        default: ColumnLayout.TwoColumn,
      },
      columnColor: {
        default: '#f3f4f6',
        parseHTML: (element) => element.getAttribute('data-column-color') || '#f3f4f6',
        renderHTML: (attributes) => {
          if (!attributes.columnColor) return {};

          return { 'data-column-color': attributes.columnColor };
        },
      },
    };
  },

  addCommands() {
    return {
      setColumns:
        () =>
        ({ commands }) =>
          commands.insertContent(
            `<div data-type="columns"><div data-type="column" data-position="left" ><p></p></div><div data-type="column" data-position="right" class="column"><p></p></div></div>`,
          ),
      setLayout:
        (layout: ColumnLayout) =>
        ({ commands }) =>
          commands.updateAttributes('columns', { layout }),
      setColumnColor:
        (color: string) =>
        ({ commands }) =>
          commands.updateAttributes('columns', { columnColor: color }),
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'columns', class: `layout-${HTMLAttributes.layout}` }, 0];
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ];
  },
});

export default Columns;
