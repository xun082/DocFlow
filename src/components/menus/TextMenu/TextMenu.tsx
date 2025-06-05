import { BubbleMenu, Editor } from '@tiptap/react';
import { memo, useEffect, useState, useCallback } from 'react';
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

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = memo(Toolbar.Button);
const MemoColorPicker = memo(ColorPicker);
const MemoFontFamilyPicker = memo(FontFamilyPicker);
const MemoFontSizePicker = memo(FontSizePicker);
const MemoContentTypePicker = memo(ContentTypePicker);

export type TextMenuProps = {
  editor: Editor;
};

// 视口边界检测函数
const getViewportBoundary = () => {
  return {
    top: window.scrollY,
    bottom: window.scrollY + window.innerHeight,
    left: window.scrollX,
    right: window.scrollX + window.innerWidth,
  };
};

export const TextMenu = memo(({ editor }: TextMenuProps) => {
  const [selecting, setSelecting] = useState(false);
  const [spellCheckOpen, setSpellCheckOpen] = useState(false);
  const commands = useTextMenuCommands(editor);
  const states = useTextMenuStates(editor);
  const blockOptions = useTextMenuContentTypes(editor);

  useEffect(() => {
    const controller = new AbortController();
    let selectionTimeout: number;

    document.addEventListener(
      'selectionchange',
      () => {
        setSelecting(true);

        if (selectionTimeout) {
          window.clearTimeout(selectionTimeout);
        }

        selectionTimeout = window.setTimeout(() => {
          setSelecting(false);
        }, 300); // 减少延迟时间，提高响应性
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, []);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F7 键触发拼写检查
      if (event.key === 'F7') {
        event.preventDefault();
        setSpellCheckOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 自定义边界检查函数
  const getBoundaryRect = useCallback(() => {
    const viewport = getViewportBoundary();
    const padding = 16;

    return {
      top: viewport.top + padding,
      bottom: viewport.bottom - padding,
      left: viewport.left + padding,
      right: viewport.right - padding,
      width: viewport.right - viewport.left - padding * 2,
      height: viewport.bottom - viewport.top - padding * 2,
    };
  }, []);

  return (
    <BubbleMenu
      className={selecting ? 'hidden' : ''}
      tippyOptions={{
        popperOptions: {
          placement: 'top',
          strategy: 'absolute',
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
                padding: 16,
                altBoundary: true,
                altAxis: true,
                tether: false,
              },
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: [
                  'bottom',
                  'top-start',
                  'top-end',
                  'bottom-start',
                  'bottom-end',
                  'left',
                  'right',
                  'left-start',
                  'right-start',
                ],
                allowedAutoPlacements: ['top', 'bottom', 'left', 'right'],
                skipEqual: false,
              },
            },
            {
              name: 'offset',
              options: {
                offset: ({ placement }: { placement: string }) => {
                  // 根据不同的放置位置调整偏移
                  if (placement.includes('top') || placement.includes('bottom')) {
                    return [0, 12];
                  }

                  return [12, 0];
                },
              },
            },
            {
              name: 'computeStyles',
              options: {
                adaptive: true,
                roundOffsets: true,
                gpuAcceleration: true,
              },
            },
            // 添加自定义修饰符来处理边界情况
            {
              name: 'customBoundary',
              enabled: true,
              phase: 'main',
              fn: ({ state }: { state: any }) => {
                const boundary = getBoundaryRect();
                const popperOffsets = state.modifiersData?.popperOffsets;

                if (!popperOffsets) return;

                const { x, y } = popperOffsets;

                // 确保不超出边界
                if (x < boundary.left) {
                  popperOffsets.x = boundary.left;
                }

                if (x + state.rects.popper.width > boundary.right) {
                  popperOffsets.x = boundary.right - state.rects.popper.width;
                }

                if (y < boundary.top) {
                  popperOffsets.y = boundary.top;
                }

                if (y + state.rects.popper.height > boundary.bottom) {
                  popperOffsets.y = boundary.bottom - state.rects.popper.height;
                }
              },
            },
          ],
        },
        zIndex: 10000,
        maxWidth: 'min(calc(100vw - 32px), 600px)',
        interactive: true,
        animation: 'shift-away-subtle',
        duration: [200, 150],
        hideOnClick: false,
        trigger: 'manual',
        appendTo: () => document.body, // 确保添加到body，避免被父容器裁剪
        aria: {
          content: 'labelledby',
          expanded: 'auto',
        },
        // 添加主题以便样式定位
        theme: 'text-menu',
      }}
      editor={editor}
      pluginKey="textMenu"
      shouldShow={states.shouldShow}
      updateDelay={100} // 增加更新延迟，避免频繁更新
    >
      <Surface className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg rounded-lg backdrop-blur-sm">
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
          <EditLinkPopover onSetLink={commands.onLink} />
          <Popover.Root>
            <Popover.Trigger asChild>
              <MemoButton active={!!states.currentHighlight} tooltip="Highlight text">
                <Icon name="Highlighter" />
              </MemoButton>
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
                  <MemoColorPicker
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
              <MemoButton active={!!states.currentColor} tooltip="Text color">
                <Icon name="Palette" />
              </MemoButton>
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
                  <MemoColorPicker
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
              <MemoButton tooltip="拼写检查" tooltipShortcut={['F7']} active={spellCheckOpen}>
                <Icon name="Search" />
              </MemoButton>
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
              <MemoButton tooltip="More options">
                <Icon name="EllipsisVertical" />
              </MemoButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content side="top" asChild style={{ zIndex: 10001 }} avoidCollisions={true}>
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
            </Popover.Portal>
          </Popover.Root>
        </Toolbar.Wrapper>
      </Surface>
    </BubbleMenu>
  );
});
