import { Editor } from '@tiptap/react';
import { useCallback } from 'react';
import { TextSelection } from '@tiptap/pm/state';
import { toast } from 'sonner';

import { useCommentStore } from '@/stores/commentStore';

export const useTextmenuCommands = (editor: Editor) => {
  const { openPanel, setIsCreatingNewComment } = useCommentStore();
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

    // 检查是否有选中的文本
    if (selection.empty) {
      toast.error('请先选择要评论的文本');

      return false;
    }

    // 不在这里添加标记，只是打开面板准备创建评论
    // 标记将在用户发布评论后才添加
    setIsCreatingNewComment(true);
    openPanel();

    return true;
  }, [editor, openPanel, setIsCreatingNewComment]);

  const onRemoveComment = useCallback(
    (commentId: string) => {
      return editor.chain().focus().unsetComment(commentId).run();
    },
    [editor],
  );

  const onPolish = useCallback(() => {
    const { selection } = editor.state;

    // 检查是否有选中的文本
    if (selection.empty) {
      toast.error('请先选择要润色的文本');

      return false;
    }

    // 获取选中的内容和位置
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, '\n\n');
    const { from, to } = selection;

    try {
      // 全局查找并删除所有已存在的 AI 润色块
      const polishNodes: { pos: number; size: number }[] = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'aiPolish') {
          polishNodes.push({ pos, size: node.nodeSize });
        }
      });

      // 在选中内容后插入新的 AI 润色块，并删除旧的
      const inserted = editor
        .chain()
        .focus()
        .command(({ tr, state }) => {
          try {
            // 先删除所有已存在的润色节点（从后往前删除，避免位置偏移）
            polishNodes.reverse().forEach(({ pos, size }) => {
              tr.delete(pos, pos + size);
            });

            // 重新计算插入位置（因为删除了节点，位置可能发生变化）
            let adjustedTo = to;

            polishNodes.forEach(({ pos, size }) => {
              if (pos < to) {
                adjustedTo -= size;
              }
            });

            // 创建新的润色节点
            const polishNode = state.schema.nodes.aiPolish.create({
              originalContent: selectedText,
              state: 'input',
              response: '',
            });

            // 在调整后的位置插入节点
            tr.insert(adjustedTo, polishNode);

            // 保持原文的选中状态（高亮显示）
            const adjustedFrom =
              from - polishNodes.filter((n) => n.pos < from).reduce((sum, n) => sum + n.size, 0);

            tr.setSelection(TextSelection.create(tr.doc, adjustedFrom, adjustedTo));

            return true;
          } catch {
            return false;
          }
        })
        .run();

      if (!inserted) {
        toast.error('插入失败，请重试');
      }

      return inserted;
    } catch {
      toast.error('插入失败，请重试');

      return false;
    }
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
    onComment,
    onRemoveComment,
    onPolish,
  };
};
