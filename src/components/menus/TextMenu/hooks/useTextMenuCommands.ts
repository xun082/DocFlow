import { Editor } from '@tiptap/react';
import { useCallback } from 'react';

export const useTextMenuCommands = (editor: Editor) => {
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

  // 新增：获取当前选中的文本
  const getSelectedText = useCallback(() => {
    const { from, to, empty } = editor.state.selection;
    if (empty) return '';

    return editor.state.doc.textBetween(from, to, ' ');
  }, [editor]);

  // 新增：获取当前选中的位置
  const getSelectedPosition = useCallback(() => {
    const { from, to } = editor.state.selection;

    return { from, to };
  }, [editor]);

  // 简单的字符串哈希函数，用于生成稳定的ID
  const generateHash = useCallback((str: string) => {
    let hash = 0;
    if (str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }

    return Math.abs(hash).toString(36);
  }, []);

  // 新增：获取详细的选区信息（包含稳定的ID）
  const getSelectionInfo = useCallback(() => {
    const { from, to, empty } = editor.state.selection;

    if (empty) {
      console.log('📍 当前没有选中任何文本');

      return null;
    }

    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    // 获取选区的上下文（前后各20个字符）
    const contextBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, ' ');
    const contextAfter = editor.state.doc.textBetween(
      to,
      Math.min(editor.state.doc.content.size, to + 20),
      ' ',
    );

    // 生成基于内容和上下文的稳定ID
    const contentForHash = `${contextBefore}|${selectedText}|${contextAfter}`;
    const contentHash = generateHash(contentForHash);
    const stableId = `sel_${contentHash}_${from}_${to}`;

    const selectionInfo = {
      id: stableId,
      text: selectedText,
      range: { from, to },
      length: selectedText.length,
      context: {
        before: contextBefore,
        after: contextAfter,
      },
      timestamp: Date.now(),
      documentLength: editor.state.doc.content.size,
      contentHash,
    };

    console.log('🎯 选区信息详情：', {
      '📝 选中文本': selectedText,
      '🆔 稳定ID': stableId,
      '🧮 内容哈希': contentHash,
      '📍 选区范围': `${from} - ${to}`,
      '📏 文本长度': selectedText.length,
      '📄 文档总长度': editor.state.doc.content.size,
      '⏰ 时间戳': new Date(selectionInfo.timestamp).toLocaleString(),
      '🔍 前文上下文': contextBefore,
      '🔍 后文上下文': contextAfter,
      '🔗 哈希内容': contentForHash,
      '📦 完整对象': selectionInfo,
    });

    return selectionInfo;
  }, [editor, generateHash]);

  // 新增：为选中文本添加评论标记
  const setCommentMark = useCallback(
    (commentId: string) => {
      return editor.chain().focus().setCommentMark({ commentId }).run();
    },
    [editor],
  );

  // 新增：移除评论标记
  const unsetCommentMark = useCallback(
    (commentId: string) => {
      // 找到所有带有该commentId的评论标记并移除
      const { state } = editor;
      const { doc } = state;
      let tr = state.tr;

      doc.descendants((node, pos) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'commentMark' && mark.attrs.commentId === commentId) {
              tr = tr.removeMark(pos, pos + node.nodeSize, mark.type);
            }
          });
        }
      });

      if (tr.docChanged) {
        editor.view.dispatch(tr);
      }
    },
    [editor],
  );

  // 新增：检查当前选区是否包含评论标记，并返回mark_id
  const getCommentMarkIds = useCallback(() => {
    const { from, to } = editor.state.selection;
    const markIds = new Set<string>();

    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type.name === 'commentMark' && mark.attrs.commentId) {
            markIds.add(mark.attrs.commentId);
          }
        });
      }
    });

    return Array.from(markIds);
  }, [editor]);

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
    getSelectedText,
    getSelectedPosition,
    getSelectionInfo,
    setCommentMark,
    unsetCommentMark,
    getCommentMarkIds,
  };
};
