import { Table as TiptapTable } from '@tiptap/extension-table';
import { Plugin } from '@tiptap/pm/state';

export const Table = TiptapTable.extend({
  renderHTML({ HTMLAttributes }) {
    // 返回新的节点结构，在最外层包裹 div
    return [
      'div',
      { class: 'table-wrapper' },
      ['table', HTMLAttributes, 0],
      [
        'div',
        {
          class:
            'add-row-btn bg-primary-500 hover:bg-primary-600 hover:text-black text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        },
        '+ 添加行',
      ],
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        view: (editorView) => {
          // 存储已绑定事件的按钮
          const boundButtons = new Set();

          // 更新按钮状态和绑定事件
          const updateButtonStates = () => {
            // 查找所有表格包装器中的按钮
            // 在文档中查找对应的表格节点
            editorView.state.doc.descendants((node, pos) => {
              if (node.type.name === 'table') {
                const button = editorView.dom
                  .querySelector(`[data-id="${node.attrs.id}"]`)
                  ?.parentElement?.querySelector('.add-row-btn');

                // 检查是否已经绑定过事件
                if (button && !boundButtons.has(button)) {
                  boundButtons.add(button);

                  button.addEventListener('click', () => {
                    console.log('按钮被点击了');

                    // 直接使用 ProseMirror 的方式添加行
                    const schema = editorView.state.schema;
                    const tableRow = schema.nodes.tableRow;
                    const tableCell = schema.nodes.tableCell;

                    if (tableRow && tableCell) {
                      // 获取表格的列数
                      let colCount = 0;
                      node.firstChild?.forEach(() => {
                        colCount++;
                      });

                      console.log('表格列数:', colCount);

                      // 创建新行
                      const cells: any[] = [];

                      for (let i = 0; i < colCount; i++) {
                        cells.push(tableCell.createAndFill());
                      }

                      const newRow = tableRow.create(null, cells);
                      console.log('🚀 ~ button.addEventListener ~ newRow:', newRow);

                      // 在表格末尾插入新行
                      const insertPos = pos + node.nodeSize - 1;
                      const tr = editorView.state.tr.insert(insertPos, newRow);
                      editorView.dispatch(tr);

                      console.log('新行已插入');
                    }
                  });
                }
              }
            });
          };

          return {
            update: () => {
              updateButtonStates();
            },
            destroy: () => {
              boundButtons.clear();
            },
          };
        },
      }),
    ];
  },
}).configure({ resizable: true, lastColumnResizable: false });

export default Table;
