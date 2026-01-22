import { memo, useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Editor } from '@tiptap/react';

import { CustomBubbleMenu } from './BubbleMenu';
import { useTextmenuStates } from './hooks/useTextMenuStates';
import { useTextmenuCommands } from './hooks/useTextMenuCommands';
import { useTextmenuContentTypes } from './hooks/useTextMenuContentTypes';
import { FontFamilyPicker } from './components/FontFamilyPicker';
import { FontSizePicker } from './components/FontSizePicker';
import { ContentTypePicker } from './components/ContentTypePicker';
import { EditLinkPopover } from './components/EditLinkPopover';

import { Icon } from '@/components/ui/Icon';
import { Toolbar } from '@/components/ui/Toolbar';
import { Surface } from '@/components/ui/Surface';
import { ColorPicker } from '@/components/panels';

// 记忆化按钮组件,避免每次编辑器状态变化时重新渲染
const MemoButton = memo(Toolbar.Button);
const MemoColorPicker = memo(ColorPicker);
const MemoFontFamilyPicker = memo(FontFamilyPicker);
const MemoFontSizePicker = memo(FontSizePicker);
const MemoContentTypePicker = memo(ContentTypePicker);

export type TextMenuProps = {
  editor: Editor;
};

export const TextMenu = ({ editor }: TextMenuProps) => {
  const [selecting, setSelecting] = useState(false);
  const commands = useTextmenuCommands(editor);
  const states = useTextmenuStates(editor);
  const blockOptions = useTextmenuContentTypes(editor);

  // 监听选区变化,添加短暂延迟以避免菜单闪烁
  useEffect(() => {
    let selectionTimeout: number;

    const onSelectionChange = () => {
      setSelecting(true);

      if (selectionTimeout) {
        window.clearTimeout(selectionTimeout);
      }

      selectionTimeout = window.setTimeout(() => {
        setSelecting(false);
      }, 500);
    };

    editor.on('selectionUpdate', onSelectionChange);

    return () => {
      editor.off('selectionUpdate', onSelectionChange);
    };
  }, [editor]);

  return (
    <CustomBubbleMenu
      editor={editor}
      className={selecting ? 'hidden' : ''}
      shouldShow={states.shouldShow}
      placement="top"
      offsetDistance={6}
      boundaryPadding={6}
      updateDelay={0}
      boundaryElement={editor.view.dom}
    >
      <Toolbar.Wrapper>
        <Toolbar.Divider />
        <MemoContentTypePicker options={blockOptions} />
        <MemoFontFamilyPicker onChange={commands.onSetFont} value={states.currentFont || ''} />
        <MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ''} />
        <Toolbar.Divider />
        <MemoButton
          tooltip="Bold"
          tooltipShortcut={['Mod', 'B']}
          onClick={commands.onBold}
          active={states.isBold}
        >
          <Icon name="Bold" />
        </MemoButton>
        <MemoButton
          tooltip="Italic"
          tooltipShortcut={['Mod', 'I']}
          onClick={commands.onItalic}
          active={states.isItalic}
        >
          <Icon name="Italic" />
        </MemoButton>
        <MemoButton
          tooltip="Underline"
          tooltipShortcut={['Mod', 'U']}
          onClick={commands.onUnderline}
          active={states.isUnderline}
        >
          <Icon name="Underline" />
        </MemoButton>
        <MemoButton
          tooltip="Strikehrough"
          tooltipShortcut={['Mod', 'Shift', 'S']}
          onClick={commands.onStrike}
          active={states.isStrike}
        >
          <Icon name="Strikethrough" />
        </MemoButton>
        <MemoButton
          tooltip="Code"
          tooltipShortcut={['Mod', 'E']}
          onClick={commands.onCode}
          active={states.isCode}
        >
          <Icon name="Code" />
        </MemoButton>
        <MemoButton tooltip="Code block" onClick={commands.onCodeBlock}>
          <Icon name="FileCode" />
        </MemoButton>
        <MemoButton
          tooltip="添加评论"
          tooltipShortcut={['Mod', 'Shift', 'M']}
          onClick={commands.onComment}
          active={states.isComment}
        >
          <Icon name="MessageCircle" />
        </MemoButton>
        <EditLinkPopover onSetLink={commands.onLink} />
        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton active={!!states.currentHighlight} tooltip="Highlight text">
              <Icon name="Highlighter" />
            </MemoButton>
          </Popover.Trigger>
          <Popover.Content side="top" sideOffset={8} asChild>
            <Surface className="p-1">
              <MemoColorPicker
                color={states.currentHighlight}
                onChange={commands.onChangeHighlight}
                onClear={commands.onClearHighlight}
              />
            </Surface>
          </Popover.Content>
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton active={!!states.currentColor} tooltip="Text color">
              <Icon name="Palette" />
            </MemoButton>
          </Popover.Trigger>
          <Popover.Content side="top" sideOffset={8} asChild>
            <Surface className="p-1">
              <MemoColorPicker
                color={states.currentColor}
                onChange={commands.onChangeColor}
                onClear={commands.onClearColor}
              />
            </Surface>
          </Popover.Content>
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton tooltip="More options">
              <Icon name="EllipsisVertical" />
            </MemoButton>
          </Popover.Trigger>
          <Popover.Content side="top" asChild>
            <Toolbar.Wrapper>
              <MemoButton
                tooltip="Subscript"
                tooltipShortcut={['Mod', '.']}
                onClick={commands.onSubscript}
                active={states.isSubscript}
              >
                <Icon name="Subscript" />
              </MemoButton>
              <MemoButton
                tooltip="Superscript"
                tooltipShortcut={['Mod', ',']}
                onClick={commands.onSuperscript}
                active={states.isSuperscript}
              >
                <Icon name="Superscript" />
              </MemoButton>
              <Toolbar.Divider />
              <MemoButton
                tooltip="Align left"
                tooltipShortcut={['Shift', 'Mod', 'L']}
                onClick={commands.onAlignLeft}
                active={states.isAlignLeft}
              >
                <Icon name="AlignLeft" />
              </MemoButton>
              <MemoButton
                tooltip="Align center"
                tooltipShortcut={['Shift', 'Mod', 'E']}
                onClick={commands.onAlignCenter}
                active={states.isAlignCenter}
              >
                <Icon name="AlignCenter" />
              </MemoButton>
              <MemoButton
                tooltip="Align right"
                tooltipShortcut={['Shift', 'Mod', 'R']}
                onClick={commands.onAlignRight}
                active={states.isAlignRight}
              >
                <Icon name="AlignRight" />
              </MemoButton>
              <MemoButton
                tooltip="Justify"
                tooltipShortcut={['Shift', 'Mod', 'J']}
                onClick={commands.onAlignJustify}
                active={states.isAlignJustify}
              >
                <Icon name="AlignJustify" />
              </MemoButton>
            </Toolbar.Wrapper>
          </Popover.Content>
        </Popover.Root>
      </Toolbar.Wrapper>
    </CustomBubbleMenu>
  );
};
