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
    ({ view, from }: ShouldShowProps = {} as ShouldShowProps) => {
      // 基本检查：编辑器是否存在且不在拖拽状态
      if (!editor || !editor.view || !view || editor.view.dragging) {
        return false;
      }

      // 检查编辑器是否聚焦
      if (!editor.isFocused) {
        return false;
      }

      // 检查选择是否有效
      const { state } = editor;

      if (!state || !state.selection) {
        return false;
      }

      const { selection } = state;
      const { from: selFrom, to: selTo, empty } = selection;

      // 如果选择为空，不显示菜单
      if (empty) {
        return false;
      }

      // 检查选择范围是否有效
      if (selFrom < 0 || selTo > state.doc.content.size) {
        return false;
      }

      try {
        // 安全地获取DOM节点
        const fromPos = from ?? selFrom;

        if (fromPos < 0 || fromPos > state.doc.content.size) {
          return false;
        }

        const domAtPos = view.domAtPos(fromPos);

        if (!domAtPos || !domAtPos.node) {
          return false;
        }

        const domAtPosNode = domAtPos.node as HTMLElement;

        // 尝试获取节点DOM，如果失败则使用domAtPos
        let nodeDOM: HTMLElement | null = null;

        try {
          nodeDOM = view.nodeDOM(fromPos) as HTMLElement;
        } catch {
          // 如果获取nodeDOM失败，使用domAtPos作为备选
          nodeDOM = domAtPosNode;
        }

        const node = nodeDOM || domAtPosNode;

        // 检查是否选择了自定义节点
        if (isCustomNodeSelected(editor, node)) {
          return false;
        }

        // 检查是否在表格单元格内（表格有自己的菜单）
        if (editor.isActive('table')) {
          return false;
        }

        // 检查是否选择了图片或其他媒体元素
        if (editor.isActive('image') || editor.isActive('imageBlock')) {
          return false;
        }

        // 检查是否在代码块内（代码块通常不需要格式化菜单）
        if (editor.isActive('codeBlock')) {
          return false;
        }

        // 最终检查：是否选择了文本

        return isTextSelected({ editor });
      } catch (error) {
        // 如果发生任何错误，安全地返回false
        console.warn('TextMenu shouldShow error:', error);

        return false;
      }
    },
    [editor],
  );

  return {
    shouldShow,
    ...states,
  };
};
