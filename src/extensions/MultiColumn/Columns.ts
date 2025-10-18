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
      insertColumn: () => ReturnType;
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
            `<div data-type="columns"><div data-type="column" data-position="left"><p></p></div><div data-type="column" data-position="right"><p></p></div></div>`,
          ),
      setLayout:
        (layout: ColumnLayout) =>
        ({ commands }) =>
          commands.updateAttributes('columns', { layout }),
      // 在当前选中的 columns 节点中增加一个新列
      insertColumn:
        () =>
        ({ commands, view }) => {
          if (!view || !view.state) return false;

          try {
            const { state } = view;
            const { selection } = state;
            const { $from } = selection;

            let columnsPos = -1;
            let columnsNode = null;

            // 从当前节点向上查找 columns 节点
            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth);

              if (node.type.name === 'columns') {
                columnsPos = $from.before(depth);
                columnsNode = node;
                break;
              }
            }

            // 如果找到了 columns 节点，在其末尾添加新列
            if (columnsPos >= 0 && columnsNode) {
              // 计算新的列数和每列宽度
              const newColumnCount = columnsNode.childCount + 1;
              const widthPercent = Math.floor(100 / newColumnCount);

              // 创建事务来更新现有列的宽度
              let tr = state.tr;

              // 遍历并更新所有现有列的宽度
              let pos = columnsPos + 1; // 跳过columns节点的开始标记
              columnsNode.forEach((node) => {
                if (node.type.name === 'column') {
                  const nodePos = pos;
                  // 更新列的style属性
                  tr = tr.setNodeMarkup(nodePos, null, {
                    ...node.attrs,
                    style: `width: ${widthPercent}%`,
                  });
                  pos += node.nodeSize;
                }
              });

              // 应用事务
              view.dispatch(tr);

              // 创建新列并插入
              const columnPosition = `column-${newColumnCount}`;
              const newColumnHtml = `<div data-type="column" data-position="${columnPosition}" style="width: ${widthPercent}%"><p></p></div>`;
              const endPos = columnsPos + columnsNode.nodeSize - 1;

              return commands.insertContentAt(endPos, newColumnHtml);
            }

            return false;
          } catch (error) {
            console.error('插入新列失败:', error);

            return false;
          }
        },
    };
  },

  renderHTML({}) {
    return ['div', { 'data-type': 'columns', class: `` }, 0];
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
