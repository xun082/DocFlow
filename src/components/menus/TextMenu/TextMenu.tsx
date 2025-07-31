'use client';

import { BubbleMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';

import { useTextMenuStates } from './hooks/useTextMenuStates';
import { useTextMenuCommands } from './hooks/useTextMenuCommands';
import { FontFamilyPicker } from './components/FontFamilyPicker';
import { FontSizePicker } from './components/FontSizePicker';
import { useTextMenuContentTypes } from './hooks/useTextMenuContentTypes';
import { ContentTypePicker } from './components/ContentTypePicker';
import { EditLinkPopover } from './components/EditLinkPopover';
import { SpellCheckPanel } from './components/SpellCheckPanel';

import { Surface } from '@/components/ui/Surface';
import { ColorPicker } from '@/components/panels';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';

export function TextMenu({ editor }: { editor: Editor }) {
  const [spellCheckOpen, setSpellCheckOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const commands = useTextMenuCommands(editor);
  const states = useTextMenuStates(editor);
  const blockOptions = useTextMenuContentTypes(editor);

  // 简化输入状态管理 - 暂时禁用以避免阻塞TextMenu显示
  useEffect(() => {
    if (!editor) return;

    let typingTimeout: number;

    const handleUpdate = () => {
      // setIsTyping(true); // 暂时保持注释状态

      // 清除之前的定时器
      if (typingTimeout) {
        window.clearTimeout(typingTimeout);
      }

      // 快速重置输入状态
      typingTimeout = window.setTimeout(() => {
        setIsTyping(false);
      }, 100); // 大幅减少延迟时间
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (typingTimeout) window.clearTimeout(typingTimeout);
    };
  }, [editor]);

  // 键盘快捷键监听和输入检测
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F7 键触发拼写检查
      if (event.key === 'F7') {
        event.preventDefault();
        setSpellCheckOpen((prev) => !prev);
      }

      // 检测是否是输入键（字母、数字、空格等）
      const isInputKey =
        event.key.length === 1 ||
        event.key === 'Backspace' ||
        event.key === 'Delete' ||
        event.key === 'Enter';

      if (isInputKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        setIsTyping(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <BubbleMenu
        options={{
          placement: 'top',
          offset: 8,
        }}
        editor={editor}
        pluginKey="textMenu"
        shouldShow={({ state }: { state: any }) => {
          const { selection } = state;
          const { empty } = selection;

          // 不显示菜单的情况
          if (empty) return false;
          if (isTyping) return false;

          // 检查选择的内容是否在编辑器视图内
          const { $from, $to } = selection;
          if ($from.pos === $to.pos) return false;
          // 如果选择了代码块，不显示菜单
          if (editor.isActive('codeBlock')) return false;

          // 确保选择了实际内容
          const selectedText = state.doc.textBetween($from.pos, $to.pos, ' ');
          if (!selectedText || selectedText.trim().length === 0) return false;

          return true;
        }}
        updateDelay={50}
      >
        <Surface
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg rounded-lg backdrop-blur-sm"
          style={{ zIndex: 10000 }}
        >
          <Toolbar.Wrapper>
            <Toolbar.Divider />
            <ContentTypePicker options={blockOptions} />
            <FontFamilyPicker onChange={commands.onSetFont} value={states.currentFont || ''} />
            <FontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ''} />
            <Toolbar.Divider />
            <Toolbar.Button
              tooltip="Bold"
              tooltipShortcut={['Mod', 'B']}
              onClick={commands.onBold}
              active={states.isBold}
            >
              <Icon name="Bold" />
            </Toolbar.Button>
            <Toolbar.Button
              tooltip="Italic"
              tooltipShortcut={['Mod', 'I']}
              onClick={commands.onItalic}
              active={states.isItalic}
            >
              <Icon name="Italic" />
            </Toolbar.Button>
            <Toolbar.Button
              tooltip="Underline"
              tooltipShortcut={['Mod', 'U']}
              onClick={commands.onUnderline}
              active={states.isUnderline}
            >
              <Icon name="Underline" />
            </Toolbar.Button>
            <Toolbar.Button
              tooltip="Strikehrough"
              tooltipShortcut={['Mod', 'Shift', 'S']}
              onClick={commands.onStrike}
              active={states.isStrike}
            >
              <Icon name="Strikethrough" />
            </Toolbar.Button>
            <Toolbar.Button
              tooltip="Code"
              tooltipShortcut={['Mod', 'E']}
              onClick={commands.onCode}
              active={states.isCode}
            >
              <Icon name="Code" />
            </Toolbar.Button>
            <Toolbar.Button tooltip="Code block" onClick={commands.onCodeBlock}>
              <Icon name="FileCode" />
            </Toolbar.Button>
            <EditLinkPopover onSetLink={commands.onLink} />

            <Popover.Root>
              <Popover.Trigger asChild>
                <Toolbar.Button active={!!states.currentHighlight} tooltip="Highlight text">
                  <Icon name="Highlighter" />
                </Toolbar.Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={8}
                  asChild
                  style={{ zIndex: 10001 }} // 确保弹出内容有更高的z-index
                  avoidCollisions={true}
                >
                  <Surface className="p-1">
                    <ColorPicker
                      color={states.currentHighlight}
                      onChange={commands.onChangeHighlight}
                      onClear={commands.onClearHighlight}
                    />
                  </Surface>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <Popover.Root>
              <Popover.Trigger asChild>
                <Toolbar.Button active={!!states.currentColor} tooltip="Text color">
                  <Icon name="Palette" />
                </Toolbar.Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={8}
                  asChild
                  style={{ zIndex: 10001 }}
                  avoidCollisions={true}
                >
                  <Surface className="p-1">
                    <ColorPicker
                      color={states.currentColor}
                      onChange={commands.onChangeColor}
                      onClear={commands.onClearColor}
                    />
                  </Surface>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            {/* 错字检测按钮 */}
            <Popover.Root open={spellCheckOpen} onOpenChange={setSpellCheckOpen}>
              <Popover.Trigger asChild>
                <Toolbar.Button tooltip="拼写检查" tooltipShortcut={['F7']} active={spellCheckOpen}>
                  <Icon name="Search" />
                </Toolbar.Button>
              </Popover.Trigger>
              <Popover.Portal container={document.body}>
                <Popover.Content
                  side="top"
                  sideOffset={8}
                  asChild
                  style={{ zIndex: 100000 }}
                  avoidCollisions={false}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onEscapeKeyDown={() => setSpellCheckOpen(false)}
                  onPointerDownOutside={(e) => {
                    // 更宽松的关闭逻辑，避免意外关闭
                    const target = e.target as HTMLElement;

                    // 如果点击的是面板内容，阻止关闭
                    if (target.closest('[data-spell-check-panel]')) {
                      e.preventDefault();

                      return;
                    }

                    // 如果点击的是编辑器内容区域，也阻止关闭（用户可能在选择文本）
                    if (target.closest('.ProseMirror')) {
                      e.preventDefault();

                      return;
                    }

                    // 如果点击的是工具栏按钮，阻止关闭
                    if (target.closest('[data-testid="toolbar"]') || target.closest('.tippy-box')) {
                      e.preventDefault();

                      return;
                    }

                    // 只有点击页面其他区域时才关闭
                    setSpellCheckOpen(false);
                  }}
                  onInteractOutside={(e) => {
                    // 防止所有交互导致关闭，除非明确点击关闭按钮
                    e.preventDefault();
                  }}
                >
                  <SpellCheckPanel editor={editor} onClose={() => setSpellCheckOpen(false)} />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <Popover.Root>
              <Popover.Trigger asChild>
                <Toolbar.Button tooltip="More options">
                  <Icon name="EllipsisVertical" />
                </Toolbar.Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  asChild
                  style={{ zIndex: 10001 }}
                  avoidCollisions={true}
                >
                  <Toolbar.Wrapper>
                    <Toolbar.Button
                      tooltip="Subscript"
                      tooltipShortcut={['Mod', '.']}
                      onClick={commands.onSubscript}
                      active={states.isSubscript}
                    >
                      <Icon name="Subscript" />
                    </Toolbar.Button>
                    <Toolbar.Button
                      tooltip="Superscript"
                      tooltipShortcut={['Mod', ',']}
                      onClick={commands.onSuperscript}
                      active={states.isSuperscript}
                    >
                      <Icon name="Superscript" />
                    </Toolbar.Button>
                    <Toolbar.Divider />
                    <Toolbar.Button
                      tooltip="Align left"
                      tooltipShortcut={['Shift', 'Mod', 'L']}
                      onClick={commands.onAlignLeft}
                      active={states.isAlignLeft}
                    >
                      <Icon name="AlignLeft" />
                    </Toolbar.Button>
                    <Toolbar.Button
                      tooltip="Align center"
                      tooltipShortcut={['Shift', 'Mod', 'E']}
                      onClick={commands.onAlignCenter}
                      active={states.isAlignCenter}
                    >
                      <Icon name="AlignCenter" />
                    </Toolbar.Button>
                    <Toolbar.Button
                      tooltip="Align right"
                      tooltipShortcut={['Shift', 'Mod', 'R']}
                      onClick={commands.onAlignRight}
                      active={states.isAlignRight}
                    >
                      <Icon name="AlignRight" />
                    </Toolbar.Button>
                    <Toolbar.Button
                      tooltip="Justify"
                      tooltipShortcut={['Shift', 'Mod', 'J']}
                      onClick={commands.onAlignJustify}
                      active={states.isAlignJustify}
                    >
                      <Icon name="AlignJustify" />
                    </Toolbar.Button>
                  </Toolbar.Wrapper>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </Toolbar.Wrapper>
        </Surface>
      </BubbleMenu>
    </>
  );
}
