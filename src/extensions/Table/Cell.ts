import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { getCellsInColumn, isRowSelected, selectRow, getCellsInTable } from './utils';

export interface TableCellOptions {
  HTMLAttributes: Record<string, any>;
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  content: 'block+', // TODO: Do not allow table in table

  tableRole: 'cell',

  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'td' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addAttributes() {
    return {
      colspan: {
        default: 1,
        parseHTML: (element) => {
          const colspan = element.getAttribute('colspan');
          const value = colspan ? parseInt(colspan, 10) : 1;

          return value;
        },
      },
      rowspan: {
        default: 1,
        parseHTML: (element) => {
          const rowspan = element.getAttribute('rowspan');
          const value = rowspan ? parseInt(rowspan, 10) : 1;

          return value;
        },
      },
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute('colwidth');
          const value = colwidth ? [parseInt(colwidth, 10)] : null;

          return value;
        },
      },
      style: {
        default: null,
      },
      showMenu: {
        default: false,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => {
            const { isEditable } = this.editor;

            if (!isEditable) {
              return DecorationSet.empty;
            }

            // 获取所有的 cell

            const { doc, selection } = state;
            const decorations: Decoration[] = [];
            const cells = getCellsInColumn(0)(selection);

            if (cells) {
              cells.forEach(({ pos }: { pos: number }, index: number) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection);
                    let className = 'grip-row';

                    if (rowSelected) {
                      className += ' selected';
                    }

                    if (index === 0) {
                      className += ' first';
                    }

                    if (index === cells.length - 1) {
                      className += ' last';
                    }

                    const grip = document.createElement('a');

                    grip.className = className;
                    grip.addEventListener('mousedown', (event) => {
                      event.preventDefault();
                      event.stopImmediatePropagation();

                      this.editor.view.dispatch(selectRow(index)(this.editor.state.tr));
                    });

                    return grip;
                  }),
                );
              });
            }

            // 给每个 cell 的右边增加一个 a 标签
            const allCells = getCellsInTable(selection);

            if (allCells && allCells?.length !== 0) {
              allCells.forEach(({ pos }: { pos: number }) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const grip = document.createElement('a');

                    grip.className += ' right';
                    grip.setAttribute('data-table-cell-grip', 'true');

                    grip.addEventListener('mousedown', (event) => {
                      event.preventDefault();
                      event.stopImmediatePropagation();

                      // 获取当前单元格的位置
                      const cellPos = pos + 1;
                      const { tr } = this.editor.state;

                      // 首先清除所有单元格的 showMenu 属性
                      const allTableCells = getCellsInTable(this.editor.state.selection);

                      if (allTableCells) {
                        allTableCells.forEach(({ pos: cellPosition }) => {
                          const resolvedPos = tr.doc.resolve(cellPosition + 1);

                          if (resolvedPos.parent.type.name === 'tableCell') {
                            tr.setNodeMarkup(cellPosition, undefined, {
                              ...resolvedPos.parent.attrs,
                              showMenu: false,
                            });
                          }
                        });
                      }

                      // 设置当前单元格的 showMenu 为 true
                      const resolvedPos = tr.doc.resolve(cellPos);

                      if (resolvedPos.parent.type.name === 'tableCell') {
                        tr.setNodeMarkup(pos, undefined, {
                          ...resolvedPos.parent.attrs,
                          showMenu: true,
                        });
                      }

                      this.editor.view.dispatch(tr);
                    });

                    return grip;
                  }),
                );
              });
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
