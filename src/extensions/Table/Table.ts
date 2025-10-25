import { Table as TiptapTable } from '@tiptap/extension-table';
import { Plugin } from '@tiptap/pm/state';
import { Node } from '@tiptap/pm/model';

export const Table = TiptapTable.extend({
  renderHTML({ HTMLAttributes }) {
    // 返回新的节点结构，在最外层包裹 div
    return [
      'div',
      { class: 'table-wrapper my-8 group' },
      ['table', HTMLAttributes, 0],
      [
        'div',
        {
          class:
            'text-center add-row-btn group-hover:text-black text-white  cursor-pointer py-1 text-[10px] transition-all duration-200 shadow-sm active:bg-primary-700 opacity-0 group-hover:opacity-100',
          tabindex: '-1',
        },
        '+ 添加行',
      ],
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        view: (editorView) => {
          // 存储按钮和对应的事件监听器
          const buttonListeners = new Map<HTMLElement, () => void>();

          // 提取的点击事件处理函数
          const createClickHandler = (node: Node, pos: number) => {
            return () => {
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

                // 创建新行
                const cells: Node[] | null = [];

                for (let i = 0; i < colCount; i++) {
                  const cell = tableCell.createAndFill();
                  if (cell) cells.push(cell);
                }

                const newRow = tableRow.create(null, cells);

                // 找到表格的最后一行位置
                let lastRowPos = pos + 1;

                node.forEach((child, offset) => {
                  if (child.type.name === 'tableRow') {
                    // pos: 表格节点在文档中的位置
                    // offset: 当前行节点在表格中的偏移量
                    // child.nodeSize: 当前行节点的总大小(包括其内容)
                    // 计算表格最后一行的结束位置
                    lastRowPos = pos + 1 + offset + child.nodeSize;
                  }
                });

                // 在最后一行之后插入新行
                const tr = editorView.state.tr.insert(lastRowPos, newRow);
                editorView.dispatch(tr);
              }
            };
          };

          // 移除按钮的事件监听器
          const removeButtonListener = (button: HTMLElement) => {
            const listener = buttonListeners.get(button);

            if (listener) {
              button.removeEventListener('click', listener);
              buttonListeners.delete(button);
            }
          };

          const addButtonListener = (button: HTMLElement, node: Node, pos: number) => {
            removeButtonListener(button);

            const clickHandler = createClickHandler(node, pos);

            // 添加新的监听器
            button.addEventListener('click', clickHandler);

            // 存储监听器引用
            buttonListeners.set(button, clickHandler);
          };

          const updateButtonStates = () => {
            // 先清理所有现有的监听器
            buttonListeners.forEach((listener, button) => {
              removeButtonListener(button);
            });

            editorView.state.doc.descendants((node, pos) => {
              if (node.type.name === 'table') {
                const button = editorView.dom
                  .querySelector(`[data-id="${node.attrs.id}"]`)
                  ?.parentElement?.querySelector('.add-row-btn') as HTMLElement;

                if (button) {
                  // 重新绑定事件监听器
                  addButtonListener(button, node, pos);
                }
              }
            });
          };

          return {
            update: () => {
              updateButtonStates();
            },
            destroy: () => {
              // 清理所有事件监听器
              buttonListeners.forEach((listener, button) => {
                removeButtonListener(button);
              });
              buttonListeners.clear();
            },
          };
        },
      }),
    ];
  },
}).configure({ resizable: true, lastColumnResizable: false });

export default Table;
