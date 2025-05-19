import { Editor, useEditorState } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

import { ShouldShowProps } from '../../types';

import { isCustomNodeSelected, isTextSelected } from '@/utils/utils';

interface MarkCounter {
  [key: string]: number;
}

export const useTextMenuStates = (editor: Editor) => {
  // 添加额外状态来跟踪全选状态
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [dominantMarks, setDominantMarks] = useState<string[]>([]);

  // 监听选择变化
  useEffect(() => {
    const updateSelectionState = () => {
      if (!editor || !editor.state) return;

      const { from, to } = editor.state.selection;
      const isAll = from === 0 && to === editor.state.doc.content.size;
      setIsAllSelected(isAll);

      if (isAll) {
        // 计算最常见的标记
        const marks: MarkCounter = {};
        editor.state.doc.descendants((node) => {
          if (node.marks && node.marks.length > 0) {
            node.marks.forEach((mark) => {
              const type = mark.type.name;
              marks[type] = (marks[type] || 0) + 1;
            });
          }

          return true;
        });

        const dominant = Object.entries(marks)
          .sort((a, b) => b[1] - a[1])
          .map((entry) => entry[0]);

        setDominantMarks(dominant);
      } else {
        setDominantMarks([]);
      }
    };

    // 初始更新
    updateSelectionState();

    // 添加事件监听
    editor.on('selectionUpdate', updateSelectionState);

    return () => {
      editor.off('selectionUpdate', updateSelectionState);
    };
  }, [editor]);

  // 使用状态计算
  const states = useEditorState({
    editor,
    selector: useCallback(
      (ctx) => {
        // 全选状态下使用计算好的dominant marks
        if (isAllSelected && dominantMarks.length > 0) {
          return {
            isBold: dominantMarks.includes('bold'),
            isItalic: dominantMarks.includes('italic'),
            isStrike: dominantMarks.includes('strike'),
            isUnderline: dominantMarks.includes('underline'),
            isCode: dominantMarks.includes('code'),
            isSubscript: dominantMarks.includes('subscript'),
            isSuperscript: dominantMarks.includes('superscript'),
            isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }),
            isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }),
            isAlignRight: ctx.editor.isActive({ textAlign: 'right' }),
            isAlignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
            currentColor: ctx.editor.getAttributes('textStyle')?.color || undefined,
            currentHighlight: ctx.editor.getAttributes('highlight')?.color || undefined,
            currentFont: ctx.editor.getAttributes('textStyle')?.fontFamily || undefined,
            currentSize: ctx.editor.getAttributes('textStyle')?.fontSize || undefined,
          };
        }

        // 常规选择状态
        return {
          isBold: ctx.editor.isActive('bold'),
          isItalic: ctx.editor.isActive('italic'),
          isStrike: ctx.editor.isActive('strike'),
          isUnderline: ctx.editor.isActive('underline'),
          isCode: ctx.editor.isActive('code'),
          isSubscript: ctx.editor.isActive('subscript'),
          isSuperscript: ctx.editor.isActive('superscript'),
          isAlignLeft: ctx.editor.isActive({ textAlign: 'left' }),
          isAlignCenter: ctx.editor.isActive({ textAlign: 'center' }),
          isAlignRight: ctx.editor.isActive({ textAlign: 'right' }),
          isAlignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
          currentColor: ctx.editor.getAttributes('textStyle')?.color || undefined,
          currentHighlight: ctx.editor.getAttributes('highlight')?.color || undefined,
          currentFont: ctx.editor.getAttributes('textStyle')?.fontFamily || undefined,
          currentSize: ctx.editor.getAttributes('textStyle')?.fontSize || undefined,
        };
      },
      [isAllSelected, dominantMarks],
    ),
  });

  const shouldShow = useCallback(
    ({ view, from }: ShouldShowProps) => {
      if (!view || editor.view.dragging) {
        return false;
      }

      const domAtPos = view.domAtPos(from || 0).node as HTMLElement;
      const nodeDOM = view.nodeDOM(from || 0) as HTMLElement;
      const node = nodeDOM || domAtPos;

      if (isCustomNodeSelected(editor, node)) {
        return false;
      }

      return isTextSelected({ editor });
    },
    [editor],
  );

  return {
    shouldShow,
    ...states,
  };
};
