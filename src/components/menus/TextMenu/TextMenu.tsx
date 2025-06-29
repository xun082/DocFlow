import { BubbleMenu, Editor } from '@tiptap/react';
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useParams } from 'next/navigation';

import { useTextMenuStates } from './hooks/useTextMenuStates';
import { useTextMenuCommands } from './hooks/useTextMenuCommands';
import { FontFamilyPicker } from './components/FontFamilyPicker';
import { FontSizePicker } from './components/FontSizePicker';
import { useTextMenuContentTypes } from './hooks/useTextMenuContentTypes';
import { ContentTypePicker } from './components/ContentTypePicker';
import { EditLinkPopover } from './components/EditLinkPopover';
import { SpellCheckPanel } from './components/SpellCheckPanel';
import { CommentDrawer } from './components/CommentDrawer';

import { Surface } from '@/components/ui/Surface';
import { ColorPicker } from '@/components/panels';
import { Toolbar } from '@/components/ui/Toolbar';
import { Icon } from '@/components/ui/Icon';
import { useCommentSidebar } from '@/hooks/useCommentSidebar';

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = memo(Toolbar.Button);
const MemoColorPicker = memo(ColorPicker);
const MemoFontFamilyPicker = memo(FontFamilyPicker);
const MemoFontSizePicker = memo(FontSizePicker);
const MemoContentTypePicker = memo(ContentTypePicker);

/**
 * 一个自定义Hook，用于获取一个值在上次渲染时的状态。
 * @param value 需要追踪其先前状态的值。
 * @returns 该值在上次渲染时的状态。
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

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
  const params = useParams();
  const documentId = params?.room ? parseInt(params.room as string, 10) : undefined;

  const [spellCheckOpen, setSpellCheckOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const commands = useTextMenuCommands(editor);
  const states = useTextMenuStates(editor);
  const blockOptions = useTextMenuContentTypes(editor);

  // 评论功能相关状态
  const commentSidebar = useCommentSidebar(documentId || 0);
  const { comments, isOpen, close, removeComment } = commentSidebar;
  const prevCommentCount = usePrevious(comments.length);

  // 延迟初始化评论侧边栏，避免在渲染过程中同步调用状态更新
  useEffect(() => {
    if (documentId && !isOpen) {
      // 延迟初始化，避免在组件挂载时立即调用状态更新
      const timer = setTimeout(() => {
        // 加载评论列表
        commentSidebar.fetchComments();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [documentId, isOpen]);

  // 当评论列表变为空时，自动关闭侧边栏。
  // 这个effect精确地捕捉了"最后一条评论被删除"的瞬间。
  useEffect(() => {
    // 仅当侧边栏之前是打开的，且评论数从有到无时，才触发关闭。
    if (isOpen && prevCommentCount && prevCommentCount > 0 && comments.length === 0) {
      close();
    }
  }, [comments.length, prevCommentCount, isOpen, close]);

  // 监听评论标记点击事件
  useEffect(() => {
    const handleCommentMarkClick = (event: CustomEvent) => {
      const { commentId } = event.detail;
      // 找到对应的评论并高亮显示
      const comment = commentSidebar.comments.find((c) => c.mark_id === commentId);

      if (comment) {
        // 打开评论侧边栏
        commentSidebar.open();
        // 可以在这里添加高亮评论的逻辑
        setTimeout(() => {
          const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);

          if (commentElement) {
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    };

    document.addEventListener('commentMarkClicked', handleCommentMarkClick as EventListener);

    return () => {
      document.removeEventListener('commentMarkClicked', handleCommentMarkClick as EventListener);
    };
  }, [commentSidebar]);

  // 处理评论按钮点击
  const handleCommentButtonClick = useCallback(() => {
    const selectedText = commands.getSelectedText();

    if (selectedText.trim()) {
      const selectionInfo = commands.getSelectionInfo();
      console.log('🎯 点击评论按钮，当前选区信息：', selectionInfo);

      commentSidebar.setCurrentSelection(selectedText);

      // 如果评论面板已经打开且选择了相同文本，则关闭
      if (commentSidebar.isOpen && commentSidebar.currentSelection === selectedText) {
        console.log('🔄 相同文本已选中，关闭评论面板');
        commentSidebar.close();
      } else {
        console.log('🔄 打开评论面板');
        commentSidebar.open();
      }
    } else {
      console.log('⚠️ 没有选中文本，直接切换侧边栏显示状态');
      // 如果没有选中文本，直接打开/关闭侧边栏
      commentSidebar.toggle();
    }
  }, [commands, commentSidebar]);

  // 处理添加评论
  const handleAddComment = useCallback(
    (text: string, selectedText: string) => {
      console.log('🔄 handleAddComment 开始执行', { text, selectedText });

      const position = commands.getSelectedPosition();
      const commentId = Date.now().toString();

      // 获取完整的选区信息
      const selectionInfo = commands.getSelectionInfo();

      console.log('💬 正在添加评论：', {
        评论内容: text,
        选中文本: selectedText,
        评论ID: commentId,
        选区位置: position,
        完整选区信息: selectionInfo,
        传递给后端的数据: {
          commentId,
          commentText: text,
          selectionInfo,
        },
      });

      // 先添加评论标记到文档中
      console.log('🔄 添加评论标记到文档中');
      commands.setCommentMark(commentId);

      // 然后添加评论到侧边栏
      const payload = {
        content: text,
        mark_id: commentId,
        selected_text: selectedText,
      };
      console.log('🔄 调用 commentSidebar.addComment', payload);
      commentSidebar.addComment(payload);
      console.log('🔄 handleAddComment 执行完成');
    },
    [commands, commentSidebar],
  );

  // 处理删除评论
  const handleRemoveComment = useCallback(
    (id: string) => {
      const commentToRemove = comments.find((c) => c.id.toString() === id);

      if (!commentToRemove) {
        return;
      }

      // 检查这是不是这段高亮文本的最后一条评论
      const isLastCommentForText =
        comments.filter((c) => c.selection?.text === commentToRemove.selection?.text).length === 1;

      // 如果是，则移除文档中的标记
      if (isLastCommentForText && commentToRemove.mark_id) {
        commands.unsetCommentMark(commentToRemove.mark_id);
      }

      // 只负责移除评论，关闭侧边栏的逻辑已交由useEffect处理
      removeComment(commentToRemove.id);
    },
    [comments, commands, removeComment],
  );

  // 监听选择变化以更新评论侧边栏的当前选择
  useEffect(() => {
    console.log('🔄 useEffect [commands, commentSidebar, editor] 执行');
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const selectedText = commands.getSelectedText();
      console.log('🔄 handleSelectionUpdate 执行', { selectedText });
      commentSidebar.setCurrentSelection(selectedText);

      // 打印详细的选区信息
      if (selectedText.trim()) {
        const selectionInfo = commands.getSelectionInfo();

        if (selectionInfo) {
          console.log('🚀 选区信息已更新，可传递给后端：', selectionInfo);
        }
      }
    };

    console.log('🔄 绑定 selectionUpdate 事件监听器');
    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      console.log('🔄 解绑 selectionUpdate 事件监听器');
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [commands, commentSidebar.setCurrentSelection, editor]);

  // 监听编辑器输入状态
  useEffect(() => {
    if (!editor) return;

    let typingTimeout: number;

    const handleUpdate = () => {
      setIsTyping(true);

      // 清除之前的定时器
      if (typingTimeout) {
        window.clearTimeout(typingTimeout);
      }

      // 输入停止后的延迟
      typingTimeout = window.setTimeout(() => {
        setIsTyping(false);
      }, 500); // 简化延迟时间
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

      // Ctrl/Cmd + Shift + C 键触发评论
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        handleCommentButtonClick();
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
  }, [handleCommentButtonClick]);

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
    <>
      <BubbleMenu
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
        shouldShow={({ state, from, to }) => {
          // 如果正在输入，不显示菜单
          if (isTyping) return false;

          // 检查是否有选中文本
          const hasSelection = !state.selection.empty && from !== to;

          // 如果没有选中文本，不显示菜单
          if (!hasSelection) return false;

          // 检查选中的内容是否是文本
          const selectedText = state.doc.textBetween(from, to, ' ');

          // 如果没有选中任何文本内容，不显示菜单
          if (!selectedText.trim()) return false;

          // 当TextMenu显示时，自动关闭评论面板
          if (commentSidebar.isOpen) {
            console.log('🔄 TextMenu显示，自动关闭评论面板');
            setTimeout(() => {
              commentSidebar.close();
            }, 100);
          }

          return true;
        }}
        updateDelay={300} // 增加更新延迟，避免频繁更新
      >
        <Surface className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg rounded-lg backdrop-blur-sm">
          <Toolbar.Wrapper>
            <Toolbar.Divider />
            <MemoContentTypePicker options={blockOptions} />
            <MemoFontFamilyPicker onChange={commands.onSetFont} value={states.currentFont || ''} />
            <MemoFontSizePicker
              onChange={commands.onSetFontSize}
              value={states.currentSize || ''}
            />
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

            {/* 评论按钮 */}
            <MemoButton
              tooltip="添加评论"
              tooltipShortcut={['Mod', 'Shift', 'C']}
              onClick={handleCommentButtonClick}
              active={commentSidebar.isOpen}
            >
              <Icon name="MessageSquare" />
            </MemoButton>

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
                <Popover.Content
                  side="top"
                  asChild
                  style={{ zIndex: 10001 }}
                  avoidCollisions={true}
                >
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

      {/* 评论抽屉 */}
      <CommentDrawer
        isOpen={commentSidebar.isOpen}
        comments={commentSidebar.comments}
        currentSelection={commentSidebar.currentSelection}
        onClose={commentSidebar.close}
        onAddComment={handleAddComment}
        onRemoveComment={handleRemoveComment}
      />
    </>
  );
});
