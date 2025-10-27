import { Table as TiptapTable } from '@tiptap/extension-table';
import { Plugin } from '@tiptap/pm/state';
import { Node } from '@tiptap/pm/model';

export const Table = TiptapTable.extend({
  addProseMirrorPlugins() {
    // 获取父类的插件
    const plugins = this.parent?.() || [];

    return [
      ...plugins,
      new Plugin({
        view: (editorView) => {
          // 存储table元素和对应的事件监听器
          const tableListeners = new Map<HTMLElement, (event: MouseEvent) => void>();

          // 添加行的处理函数
          const addRow = (node: Node, pos: number) => {
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
                  lastRowPos = pos + 1 + offset + child.nodeSize;
                }
              });

              // 在最后一行之后插入新行
              const tr = editorView.state.tr.insert(lastRowPos, newRow);
              editorView.dispatch(tr);
            }
          };

          // 添加列的处理函数
          const addColumn = (node: Node, pos: number) => {
            const schema = editorView.state.schema;
            const tableCell = schema.nodes.tableCell;

            if (tableCell) {
              const tr = editorView.state.tr;
              let insertOffset = 0;

              // 遍历每一行，在每行末尾添加一个新单元格
              node.forEach((row, rowOffset) => {
                if (row.type.name === 'tableRow') {
                  const newCell = tableCell.createAndFill();

                  if (newCell) {
                    const rowEndPos = pos + 1 + rowOffset + row.content.size + insertOffset;
                    tr.insert(rowEndPos, newCell);
                    insertOffset += newCell.nodeSize;
                  }
                }
              });

              editorView.dispatch(tr);
            }
          };

          // 创建table点击事件处理器
          const createTableClickHandler = (
            node: Node,
            pos: number,
            wrapperElement: HTMLElement,
          ) => {
            return (event: MouseEvent) => {
              const rect = wrapperElement.getBoundingClientRect();
              const clickX = event.clientX;
              const clickY = event.clientY;

              // 动态读取伪元素尺寸，避免写死像素值
              const afterStyle = getComputedStyle(wrapperElement, '::after');
              const beforeStyle = getComputedStyle(wrapperElement, '::before');
              const afterWidth = parseFloat(afterStyle.width) || 16; // w-4 ≈ 16px
              const beforeHeight = parseFloat(beforeStyle.height) || 24; // h-6 ≈ 24px

              // 右侧“添加列”点击区域
              if (
                clickX >= rect.right &&
                clickX <= rect.right + afterWidth &&
                clickY >= rect.top &&
                clickY <= rect.bottom
              ) {
                event.preventDefault();
                event.stopPropagation();
                addColumn(node, pos);

                return;
              }

              // 底部“添加行”点击区域
              if (
                clickX >= rect.left &&
                clickX <= rect.right &&
                clickY >= rect.bottom &&
                clickY <= rect.bottom + beforeHeight
              ) {
                event.preventDefault();
                event.stopPropagation();
                addRow(node, pos);

                return;
              }
            };
          };

          // 移除table的事件监听器
          const removeTableListener = (table: HTMLElement) => {
            const listener = tableListeners.get(table);

            if (listener) {
              table.removeEventListener('click', listener);
              tableListeners.delete(table);
            }
          };

          // 添加table的事件监听器
          const addTableListener = (table: HTMLElement, handler: (event: MouseEvent) => void) => {
            removeTableListener(table);
            table.addEventListener('click', handler);
            tableListeners.set(table, handler);
          };

          const updateTableStates = () => {
            // 清理所有现有的监听器
            const tablesToRemove = Array.from(tableListeners.keys());
            tablesToRemove.forEach((table) => {
              removeTableListener(table);
            });

            editorView.state.doc.descendants((node, pos) => {
              if (node.type.name === 'table') {
                // 直接拿到该节点的 NodeView DOM（就是 tableWrapper）
                const wrapper = editorView.nodeDOM(pos) as HTMLElement;

                if (wrapper && wrapper.classList.contains('tableWrapper')) {
                  const clickHandler = createTableClickHandler(node, pos, wrapper);
                  addTableListener(wrapper, clickHandler);
                }
              }
            });
          };

          return {
            update: () => {
              updateTableStates();
            },
            destroy: () => {
              // 清理所有事件监听器
              tableListeners.forEach((listener, table) => {
                removeTableListener(table);
              });
              tableListeners.clear();
            },
          };
        },
      }),
    ];
  },
}).configure({ resizable: true, lastColumnResizable: false });

export default Table;
