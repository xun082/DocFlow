import { useEditorState } from '@tiptap/react';
import React, { useRef, JSX } from 'react';
import { v4 as uuid } from 'uuid';

import { ImageBlockWidth } from './ImageBlockWidth';

import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { MenuProps } from '@/components/menus/types';
import { getRenderContainer } from '@/utils/utils';
import { BubbleMenu } from '@/components/ui/BubbleMenu';

export function ImageBlockMenu({ editor }: MenuProps): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);

  const getReferenceClientRect = () => {
    const renderContainer = getRenderContainer(editor, 'node-imageBlock');
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0);

    return rect;
  };

  const shouldShow = () => {
    const isActive = editor.isActive('imageBlock');

    return isActive;
  };

  const onAlignImageLeft = () => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('left').run();
  };

  const onAlignImageCenter = () => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('center').run();
  };

  const onAlignImageRight = () => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('right').run();
  };

  const onWidthChange = (value: number) => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockWidth(value).run();
  };

  const { isImageCenter, isImageLeft, isImageRight, width } = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isImageLeft: ctx.editor.isActive('imageBlock', { align: 'left' }),
        isImageCenter: ctx.editor.isActive('imageBlock', { align: 'center' }),
        isImageRight: ctx.editor.isActive('imageBlock', { align: 'right' }),
        width: parseInt(ctx.editor.getAttributes('imageBlock')?.width || 0),
      };
    },
  });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={`imageBlockMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      getReferenceClientRect={getReferenceClientRect}
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
    </BubbleMenu>
  );
}

export default ImageBlockMenu;
