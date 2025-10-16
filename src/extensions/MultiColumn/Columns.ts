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
      setColumnBackgroundColor: (columnIndex: number, color: string) => ReturnType;
      swapColumns: (fromPosition: string, toPosition: string) => ReturnType;
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
      setColumnBackgroundColor:
        (columnIndex: number, color: string) =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const { $from } = selection;

          // 查找columns节点
          let columnsPos = null;

          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);

            if (node.type.name === 'columns') {
              columnsPos = $from.start(depth);
              break;
            }
          }

          if (columnsPos === null) {
            return false;
          }

          const columnsNode = state.doc.nodeAt(columnsPos);

          if (!columnsNode) {
            return false;
          }

          // 查找指定索引的column节点
          let currentIndex = 0;
          let targetColumnPos = null;

          columnsNode.forEach((child, offset) => {
            if (child.type.name === 'column' && currentIndex === columnIndex) {
              targetColumnPos = columnsPos + 1 + offset;

              return false; // 停止遍历
            }

            if (child.type.name === 'column') {
              currentIndex++;
            }
          });

          if (targetColumnPos === null) {
            return false;
          }

          // 更新column节点的backgroundColor属性
          const tr = state.tr.setNodeMarkup(targetColumnPos, undefined, {
            ...state.doc.nodeAt(targetColumnPos)?.attrs,
            backgroundColor: color,
          });

          if (dispatch) dispatch(tr);

          return true;
        },
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
