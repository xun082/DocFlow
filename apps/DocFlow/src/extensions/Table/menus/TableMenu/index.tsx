import { BubbleMenu } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';
import { EditorView } from '@tiptap/pm/view';
import { NodeSelection } from '@tiptap/pm/state';
import type { FC } from 'react';
import { useCallback, ChangeEvent } from 'react';

import { isAtLeastTwoCellsSelected } from '../../utils';
import { isRowGripSelected } from '../TableRow/utils';
import { isColumnGripSelected } from '../TableColumn/utils';

import * as PopoverMenu from '@/components/ui/PopoverMenu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps, ShouldShowProps } from '@/components/menus/types';
import { useFileUpload, useImgUpload } from '@/extensions/ImageUpload/view/hooks';

export const TableMenu: FC<MenuProps> = ({ editor }) => {
  const { handleUploadClick, ref } = useFileUpload();
  const { isUploading } = useImgUpload();

  // 使用 useEditorState 订阅编辑器状态变化，作为 BubbleMenu shouldShow 的二次检查
  const { isTableContext } = useEditorState({
    editor,
    selector: (ctx) => ({
      isTableContext:
        ctx.editor.isActive('table') &&
        !ctx.editor.isActive('imageBlock') &&
        !ctx.editor.isActive('tableImage'),
    }),
  });

  const shouldShow = ({ state, from, view }: ShouldShowProps & { view: EditorView }) => {
    if (!state || !from) {
      return false;
    }

    // 如果选中的是任何节点（图片、图表等），不显示表格菜单
    if (state.selection instanceof NodeSelection) {
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

  return (
    <>
      <BubbleMenu
        editor={editor}
        pluginKey="tableMenu"
        updateDelay={0}
        options={{
          offset: 15,
        }}
        shouldShow={shouldShow}
      >
        <Toolbar.Wrapper isVertical shouldShowContent={isTableContext}>
          {/* 内容操作 */}
          <PopoverMenu.Item
            iconComponent={<Icon name="Image" />}
            close={false}
            label="Insert image"
            onClick={onInsertImage}
            disabled={isUploading}
          />

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
};

export default TableMenu;
