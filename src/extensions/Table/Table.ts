import { Table as TiptapTable } from '@tiptap/extension-table';
import { Plugin } from '@tiptap/pm/state';
import { Node } from '@tiptap/pm/model';

export const Table = TiptapTable.extend({
  renderHTML({ HTMLAttributes }) {
    // 返回新的节点结构，在最外层包裹 div
    return [
      'div',
      { class: 'table-wrapper  group' },
      [
        'div',
        { class: 'flex' },
        ['table', HTMLAttributes, 0],
        [
          'div',
          {
            class:
              'add-col-btn group-hover:text-black text-white cursor-pointer px-1 text-[10px] transition-all duration-200 shadow-sm active:bg-primary-700 opacity-0 group-hover:opacity-100 flex items-center justify-center',
            style: 'writing-mode: vertical-rl; text-orientation: mixed;',
            tabindex: '-1',
          },
          '+ 添加列',
        ],
      ],
      [
        'div',
        {
          class:
            'w-full text-center add-row-btn group-hover:text-black text-white  cursor-pointer py-1 text-[10px] transition-all duration-200 shadow-sm active:bg-primary-700 opacity-0 group-hover:opacity-100',
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

          // 添加行的点击事件处理函数
          const createAddRowHandler = (node: Node, pos: number) => {
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
                const cells: Node[] = [];

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

          // 添加列的点击事件处理函数
          const createAddColumnHandler = (node: Node, pos: number) => {
            return () => {
              const schema = editorView.state.schema;
              const tableCell = schema.nodes.tableCell;

              if (tableCell) {
                const tr = editorView.state.tr;
                let insertOffset = 0; // 用于跟踪插入操作对位置的影响

                // 遍历每一行，在每行末尾添加一个新单元格
                node.forEach((row, rowOffset) => {
                  if (row.type.name === 'tableRow') {
                    const newCell = tableCell.createAndFill();

                    if (newCell) {
                      // 计算当前行的结束位置（行内容结束，但在行节点结束之前）
                      // pos + 1: 表格内容开始位置
                      // rowOffset: 当前行在表格中的偏移量
                      // row.content.size: 当前行内容的大小
                      // insertOffset: 之前插入操作对位置的累积影响
                      const rowEndPos = pos + 1 + rowOffset + row.content.size + insertOffset;
                      tr.insert(rowEndPos, newCell);

                      // 更新插入偏移量，每插入一个单元格，后续位置需要相应调整
                      insertOffset += newCell.nodeSize;
                    }
                  }
                });

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

          const addButtonListener = (button: HTMLElement, handler: () => void) => {
            removeButtonListener(button);

            // 添加新的监听器
            button.addEventListener('click', handler);

            // 存储监听器引用
            buttonListeners.set(button, handler);
          };

          const updateButtonStates = () => {
            // 先获取所有按钮的数组，避免在遍历时修改Map
            const buttonsToRemove = Array.from(buttonListeners.keys());

            // 清理所有现有的监听器
            buttonsToRemove.forEach((button) => {
              removeButtonListener(button);
            });

            editorView.state.doc.descendants((node, pos) => {
              if (node.type.name === 'table') {
                const parentElement = editorView.dom.querySelector(
                  `[data-id="${node.attrs.id}"]`,
                )?.parentElement;

                const addRowButton = parentElement?.parentElement?.querySelector(
                  '.add-row-btn',
                ) as HTMLElement;
                const addColButton = parentElement?.querySelector('.add-col-btn') as HTMLElement;

                if (addRowButton) {
                  // 重新绑定添加行事件监听器
                  addButtonListener(addRowButton, createAddRowHandler(node, pos));
                }

                if (addColButton) {
                  // 重新绑定添加列事件监听器
                  addButtonListener(addColButton, createAddColumnHandler(node, pos));
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
}).configure({ resizable: false, lastColumnResizable: false });

export default Table;
