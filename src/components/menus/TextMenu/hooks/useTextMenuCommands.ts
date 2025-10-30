import { Editor } from '@tiptap/react';
import { useCallback } from 'react';

import { useCommentStore } from '@/stores/commentStore';

export const useTextmenuCommands = (editor: Editor) => {
  const { openComment } = useCommentStore();
  const onBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor]);
  const onItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor]);
  const onStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor]);
  const onUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor]);
  const onCode = useCallback(() => editor.chain().focus().toggleCode().run(), [editor]);
  const onCodeBlock = useCallback(() => editor.chain().focus().toggleCodeBlock().run(), [editor]);

  const onSubscript = useCallback(() => editor.chain().focus().toggleSubscript().run(), [editor]);
  const onSuperscript = useCallback(
    () => editor.chain().focus().toggleSuperscript().run(),
    [editor],
  );
  const onAlignLeft = useCallback(
    () => editor.chain().focus().setTextAlign('left').run(),
    [editor],
  );
  const onAlignCenter = useCallback(
    () => editor.chain().focus().setTextAlign('center').run(),
    [editor],
  );
  const onAlignRight = useCallback(
    () => editor.chain().focus().setTextAlign('right').run(),
    [editor],
  );
  const onAlignJustify = useCallback(
    () => editor.chain().focus().setTextAlign('justify').run(),
    [editor],
  );

  const onChangeColor = useCallback(
    (color: string) => editor.chain().setColor(color).run(),
    [editor],
  );
  const onClearColor = useCallback(() => editor.chain().focus().unsetColor().run(), [editor]);

  const onChangeHighlight = useCallback(
    (color: string) => editor.chain().setHighlight({ color }).run(),
    [editor],
  );
  const onClearHighlight = useCallback(
    () => editor.chain().focus().unsetHighlight().run(),
    [editor],
  );

  const onLink = useCallback(
    (url: string, inNewTab?: boolean) =>
      editor
        .chain()
        .focus()
        .setLink({ href: url, target: inNewTab ? '_blank' : '' })
        .run(),
    [editor],
  );

  const onSetFont = useCallback(
    (font: string) => {
      if (!font || font.length === 0) {
        return editor.chain().focus().unsetFontFamily().run();
      }

      return editor.chain().focus().setFontFamily(font).run();
    },
    [editor],
  );

  const onSetFontSize = useCallback(
    (fontSize: string) => {
      if (!fontSize || fontSize.length === 0) {
        return editor.chain().focus().unsetFontSize().run();
      }

      return editor.chain().focus().setFontSize(fontSize).run();
    },
    [editor],
  );

  const onComment = useCallback(() => {
    const { selection } = editor.state;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to);

    // 获取选中文本的位置
    if (!selection.empty) {
      try {
        const { from, to } = selection;
        const startPos = editor.view.coordsAtPos(from);
        const endPos = editor.view.coordsAtPos(to);

        // 计算选中区域的中心位置
        const x = (startPos.left + endPos.left) / 2;
        const y = endPos.bottom + 4; // 在选中文本下方8px

        // 打开评论弹窗
        openComment({ x, y }, selectedText);
      } catch (error) {
        console.error('获取选中位置失败:', error);
        // 如果获取位置失败，使用默认位置
        openComment({ x: 0, y: 0 }, selectedText);
      }
    }
  }, [editor, openComment]);

  const onRemoveComment = useCallback(
    (commentId: string) => {
      return editor.chain().focus().unsetComment(commentId).run();
    },
    [editor],
  );

  return {
    onBold,
    onItalic,
    onStrike,
    onUnderline,
    onCode,
    onCodeBlock,
    onSubscript,
    onSuperscript,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    onAlignJustify,
    onChangeColor,
    onClearColor,
    onChangeHighlight,
    onClearHighlight,
    onSetFont,
    onSetFontSize,
    onLink,
    onComment,
    onRemoveComment,
  };
};
