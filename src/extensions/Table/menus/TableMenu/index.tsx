import { BubbleMenu } from '@tiptap/react/menus';
// import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { EditorView } from '@tiptap/pm/view';
import type { FC } from 'react';

import { isAtLeastTwoCellsSelected } from '../../utils';
import { isRowGripSelected } from '../TableRow/utils';
import { isColumnGripSelected } from '../TableColumn/utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';

export const TableMenu: FC<MenuProps> = ({ editor }) => {
  const shouldShow = ({ state, from, view }: ShouldShowProps & { view: EditorView }) => {
    if (!state || !from) {
      return false;
    }

    // 如果选中了行或列的控制柄，则不显示此菜单
    if (
      isRowGripSelected({ editor, view, state, from }) ||
      isColumnGripSelected({ editor, view, state, from })
    ) {
      return false;
    }

    return isAtLeastTwoCellsSelected(state.selection);
  };

  // 添加行
  const onAddRow = () => {
    editor.chain().focus().addRowAfter().run();
  };

  // 在上方插入行
  const onAddRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  // 添加列
  const onAddColumn = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  // 合并单元格
  const onMergeCells = () => {
    editor.chain().focus().mergeCells().run();
  };

  // 分割单元格
  const onSplitCell = () => {
    editor.chain().focus().splitCell().run();
  };

  // 对齐方式
  const onAlignLeft = () => {
    editor.chain().focus().setTextAlign('left').run();
  };

  const onAlignCenter = () => {
    editor.chain().focus().setTextAlign('center').run();
  };

  const onAlignRight = () => {
    editor.chain().focus().setTextAlign('right').run();
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      updateDelay={0}
      options={{
        offset: 15,
      }}
      shouldShow={shouldShow}
    >
      <Toolbar.Wrapper isVertical>
        {/* 表格操作 */}
        <PopoverMenu.Item
          iconComponent={<Icon name="ArrowUpToLine" />}
          close={false}
          label="Insert row above"
          onClick={onAddRowBefore}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="Plus" />}
          close={false}
          label="Add row"
          onClick={onAddRow}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="Plus" />}
          close={false}
          label="Add column"
          onClick={onAddColumn}
        />
        {/* <PopoverMenu.Item
          iconComponent={<Icon name="Copy" />}
          close={false}
          label="Copy table"
          onClick={onCopyTable}
        /> */}
        {/* <PopoverMenu.Item icon="Trash" close={false} label="Delete table" onClick={onDeleteTable} /> */}

        {/* 单元格操作 */}
        <PopoverMenu.Item
          iconComponent={<Icon name="TableCellsMerge" />}
          close={false}
          label="Merge cells"
          onClick={onMergeCells}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="TableCellsSplit" />}
          close={false}
          label="Split cell"
          onClick={onSplitCell}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="AlignLeft" />}
          close={false}
          label="Align left"
          onClick={onAlignLeft}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="AlignCenter" />}
          close={false}
          label="Align center"
          onClick={onAlignCenter}
        />

        <PopoverMenu.Item
          iconComponent={<Icon name="AlignRight" />}
          close={false}
          label="Align right"
          onClick={onAlignRight}
        />
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
};

export default TableMenu;
