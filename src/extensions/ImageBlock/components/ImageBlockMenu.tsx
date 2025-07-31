import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';
import React, { useCallback, useRef, JSX } from 'react';
import { v4 as uuid } from 'uuid';

import { ImageBlockWidth } from './ImageBlockWidth';

import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps } from '@/components/menus/types';

export const ImageBlockMenu = ({ editor }: MenuProps): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null);

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive('imageBlock');

    return isActive;
  }, [editor]);

  const onAlignImageLeft = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('left').run();
  }, [editor]);

  const onAlignImageCenter = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('center').run();
  }, [editor]);

  const onAlignImageRight = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('right').run();
  }, [editor]);

  const onWidthChange = useCallback(
    (value: number) => {
      editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockWidth(value).run();
    },
    [editor],
  );
  const { isImageCenter, isImageLeft, isImageRight, width } = useEditorState({
    editor,
    selector: (ctx: { editor: typeof editor }) => {
      return {
        isImageLeft: ctx.editor.isActive('imageBlock', { align: 'left' }),
        isImageCenter: ctx.editor.isActive('imageBlock', { align: 'center' }),
        isImageRight: ctx.editor.isActive('imageBlock', { align: 'right' }),
        width: parseInt(ctx.editor.getAttributes('imageBlock')?.width || 0),
      };
    },
  });

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey={`imageBlockMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      options={{
        placement: 'top',
        offset: 8,
        flip: false,
      }}
    >
      <Toolbar.Wrapper shouldShowContent={shouldShow()} ref={menuRef}>
        <Toolbar.Button tooltip="Align image left" active={isImageLeft} onClick={onAlignImageLeft}>
          <Icon name="AlignHorizontalDistributeStart" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Align image center"
          active={isImageCenter}
          onClick={onAlignImageCenter}
        >
          <Icon name="AlignHorizontalDistributeCenter" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Align image right"
          active={isImageRight}
          onClick={onAlignImageRight}
        >
          <Icon name="AlignHorizontalDistributeEnd" />
        </Toolbar.Button>
        <Toolbar.Divider />
        <ImageBlockWidth onChange={onWidthChange} value={width} />
      </Toolbar.Wrapper>
    </BaseBubbleMenu>
  );
};

export default ImageBlockMenu;
