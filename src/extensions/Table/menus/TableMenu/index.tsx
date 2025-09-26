import { BubbleMenu } from '@tiptap/react/menus';
import React, { JSX } from 'react';

import { isTableSelected, selectTable } from '../../utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';

export function TableMenu({ editor }: MenuProps): JSX.Element {
  const shouldShow = ({ state }: ShouldShowProps) => {
    if (!state) {
      return false;
    }

    return isTableSelected(state.selection);
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

  // 删除表格
  const onDeleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  // 复制表格
  const onCopyTable = () => {
    // 选中整个表格
    editor.view.dispatch(selectTable(editor.state.tr));
    // 执行复制命令
    document.execCommand('copy');
  };

  // 合并单元格
  const onMergeCells = () => {
    editor.chain().focus().mergeCells().run();
  };

  // 分割单元格
  const onSplitCell = () => {
    editor.chain().focus().splitCell().run();
  };

  // 切换表格标题
  const onToggleHeader = () => {
    editor.chain().focus().toggleHeaderCell().run();
  };

  // 清除单元格内容
  //   const onClearCells = () => {
  //     editor.chain().focus().clearCells().run();
  //   };

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
        <PopoverMenu.Item
          iconComponent={<Icon name="Copy" />}
          close={false}
          label="Copy table"
          onClick={onCopyTable}
        />
        <PopoverMenu.Item icon="Trash" close={false} label="Delete table" onClick={onDeleteTable} />

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
          iconComponent={<Icon name="Heading1" />}
          close={false}
          label="Toggle header"
          onClick={onToggleHeader}
        />
        {/* <PopoverMenu.Item
          iconComponent={<Icon name="Eraser" />}
          close={false}
          label="Clear cells"
          onClick={onClearCells}
        /> */}

        {/* 对齐方式 */}
        <PopoverMenu.Item
          iconComponent={<Icon name="AlignLeft" />}
          close={false}
          label="Left"
          onClick={onAlignLeft}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="AlignCenter" />}
          close={false}
          label="Center"
          onClick={onAlignCenter}
        />
        <PopoverMenu.Item
          iconComponent={<Icon name="AlignRight" />}
          close={false}
          label="Right"
          onClick={onAlignRight}
        />
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
}

export default TableMenu;
