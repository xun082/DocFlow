import { BubbleMenu } from '@tiptap/react/menus';
import React, { JSX, useCallback, ChangeEvent } from 'react';

import { findTable, isCellSelection, isAtLeastTwoCellsSelected } from '../../utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';
import { useFileUpload, useImgUpload } from '@/extensions/ImageUpload/view/hooks';

export function TableCellMenu({ editor }: MenuProps): JSX.Element {
  const { handleUploadClick, ref } = useFileUpload();
  const { isUploading } = useImgUpload();

  // 检查是否选中了一个表格单元格（单选，非多选）
  const isCellSelected = ({ state, from }: Pick<ShouldShowProps, 'state' | 'from'>) => {
    if (!state || !from) {
      return false;
    }

    const { selection } = state;

    // 首先检查是否在表格内
    const table = findTable(selection);

    if (!table) {
      return false;
    }

    // 检查选择类型
    if (isCellSelection(selection)) {
      // 如果是 CellSelection，检查是否只选中了一个单元格
      return !isAtLeastTwoCellsSelected(selection);
    }

    // 如果是普通的文本选择，检查是否在单个表格单元格内
    const pos = state.doc.resolve(from);

    // 查找最近的表格单元格节点
    let depth = pos.depth;
    let cellNode = null;
    let cellPos = -1;

    while (depth > 0) {
      const node = pos.node(depth);

      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
        cellNode = node;
        cellPos = pos.before(depth);
        break;
      }

      depth--;
    }

    if (!cellNode) {
      return false;
    }

    // 检查选择是否完全在单个单元格内
    const cellStart = cellPos;
    const cellEnd = cellPos + cellNode.nodeSize;

    return cellNode.attrs.showMenu && selection.from >= cellStart && selection.to <= cellEnd;
  };

  const shouldShow = ({ state, from }: ShouldShowProps) => {
    return isCellSelected({ state, from });
  };

  // 隐藏所有单元格菜单的函数
  const hideAllCellMenus = useCallback(() => {
    const { tr } = editor.state;
    let hasChanges = false;

    editor.state.doc.descendants((node, pos) => {
      if (
        (node.type.name === 'tableCell' || node.type.name === 'tableHeader') &&
        node.attrs.showMenu
      ) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          showMenu: false,
        });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      editor.view.dispatch(tr);
    }
  }, [editor]);

  // 处理图片文件上传 - 表格专用
  const handleImageFile = useCallback(
    async (file: File) => {
      try {
        const { from } = editor.state.selection;

        // 读取为base64并立即插入预览
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64Url = e.target?.result as string;

          // 插入表格图片节点
          editor.chain().focus().setTableImageAt({ src: base64Url, pos: from }).run();

          try {
            // 后台上传文件
            const uploadService = await import('@/services/upload');
            const serverUrl = await uploadService.default.uploadImage(file);

            // 查找并更新刚插入的图片节点
            let targetPos: number | null = null;

            editor.state.doc.descendants((node, pos) => {
              if (node.type.name === 'tableImage' && node.attrs.src === base64Url) {
                targetPos = pos;

                return false; // 停止遍历
              }
            });

            if (targetPos !== null) {
              editor
                .chain()
                .focus()
                .setNodeSelection(targetPos)
                .updateAttributes('tableImage', { src: serverUrl })
                .run();
            }
          } catch (uploadError) {
            console.error('图片上传失败:', uploadError);
          }
        };

        reader.onerror = () => {
          console.error('文件读取失败');
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error('表格图片上传失败:', error);
      }
    },
    [editor],
  );

  // 处理文件选择
  const onFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files?.[0]) {
        const file = e.target.files[0];
        handleImageFile(file);
      }
    },
    [handleImageFile],
  );

  // 插入图片
  const onInsertImage = () => {
    handleUploadClick();
  };

  // 合并单元格
  const onMergeCells = () => {
    editor.chain().focus().mergeCells().run();
  };

  // 拆分单元格
  const onSplitCell = () => {
    editor.chain().focus().splitCell().run();
  };

  // 对齐操作
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
    <>
      <BubbleMenu
        editor={editor}
        pluginKey="tableCellMenu"
        updateDelay={0}
        options={{
          offset: 15,
          onHide: hideAllCellMenus,
        }}
        shouldShow={shouldShow}
      >
        <Toolbar.Wrapper isVertical data-bubble-menu="tableCellMenu">
          {/* 图片插入 */}
          <PopoverMenu.Item
            iconComponent={<Icon name="Image" />}
            close={false}
            label="Insert image"
            onClick={onInsertImage}
            disabled={isUploading}
          />

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

          {/* 对齐操作 */}
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

      {/* 隐藏的文件输入 */}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}

export default TableCellMenu;
