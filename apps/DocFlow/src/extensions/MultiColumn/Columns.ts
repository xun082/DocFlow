import { Node } from '@tiptap/core';

export enum ColumnLayout {
  SidebarLeft = 'sidebar-left',
  SidebarRight = 'sidebar-right',
  TwoColumn = 'two-column',
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (rows: number) => ReturnType;
      setLayout: (layout: ColumnLayout) => ReturnType;
      insertColumn: () => ReturnType;
      setColumnClass: (handle: string) => ReturnType;
    };
  }
}

export const Columns = Node.create({
  name: 'columns',

  group: 'columns',

  content: 'column+',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      layout: {
        default: ColumnLayout.TwoColumn,
      },
      rows: {
        default: 1,
      },
    };
  },

  addCommands() {
    return {
      setColumns:
        (rowNum: number = 1) =>
        ({ commands }) => {
          // 根据 rows 参数动态创建对应数量的列
          const columns = [];

          for (let i = 0; i < rowNum; i++) {
            columns.push(`<div data-type="column" ><p></p></div>`);
          }

          return commands.insertContent(
            `<div data-type="columns" data-rows="${rowNum}">${columns.join('')}</div>`,
          );
        },
      setLayout:
        (layout: ColumnLayout) =>
        ({ commands }) =>
          commands.updateAttributes('columns', { layout }),
      // 在当前选中的 columns 节点中增加一个新列
      insertColumn:
        () =>
        ({ commands, view }) => {
          if (!view?.state?.selection) {
            return false;
          }

          try {
            const { state } = view;
            const { selection } = state;
            const { $from } = selection;

            // 查找 columns 节点 - 简化查找逻辑
            let columnsPos = -1;
            let columnsNode = null;

            // 方法1: 直接从当前位置向上查找父节点（更高效）
            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth);

              if (node?.type?.name === 'columns') {
                columnsPos = $from.before(depth);
                columnsNode = node;
                break;
              }
            }

            // 方法2: 如果方法1未找到，使用 nodesBetween 查找
            if (columnsPos < 0) {
              state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                if (node.type.name === 'columns') {
                  columnsPos = pos;
                  columnsNode = node;

                  return false; // 停止遍历
                }

                return true; // 继续遍历
              });
            }

            // 如果找到了 columns 节点，执行插入操作
            if (columnsPos >= 0 && columnsNode) {
              // 计算插入位置和创建新列
              const endPos = columnsPos + columnsNode.nodeSize - 1;
              const columnPosition = `column-${columnsNode.childCount + 1}`;
              const newColumnHtml = `<div data-type="column" data-position="${columnPosition}"><p></p></div>`;

              return commands.insertContentAt(endPos, newColumnHtml);
            }

            return false;
          } catch (error) {
            console.error('Error inserting column:', error);

            return false;
          }
        },
      setColumnClass:
        (handle) =>
        ({ commands, editor }) => {
          const attributes = editor.getAttributes('columns');

          // 当前 columns 有多少子节点
          return commands.updateAttributes('columns', {
            rows: handle === 'add' ? attributes.rows + 1 : attributes.rows - 1,
          });
        },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        ...HTMLAttributes,
        'data-type': 'columns',
        class: `layout-${HTMLAttributes.layout}`,
        style: `grid-template-columns: repeat(${HTMLAttributes.rows}, 1fr)`,
      },
      0,
    ];
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
