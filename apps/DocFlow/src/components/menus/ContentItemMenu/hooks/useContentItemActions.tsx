import { Node } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';

import { getSelectionLineRange } from '@/utils/editor';
import { useChatStore } from '@/stores/chatStore';

const useContentItemActions = (
  editor: Editor,
  currentNode: Node | null,
  currentNodePos: number,
) => {
  const { setIsOpen, addTab, setDocumentReference, setPresetMessage } = useChatStore();

  const resetTextFormatting = () => {
    const chain = editor.chain();

    chain.setNodeSelection(currentNodePos).unsetAllMarks();

    if (currentNode?.type.name !== 'paragraph') {
      chain.setParagraph();
    }

    chain.run();
  };

  const duplicateNode = () => {
    editor.commands.setNodeSelection(currentNodePos);

    const { $anchor } = editor.state.selection;
    const selectedNode = $anchor.node(1) || (editor.state.selection as NodeSelection).node;

    editor
      .chain()
      .setMeta('hideDragHandle', true)
      .insertContentAt(currentNodePos + (currentNode?.nodeSize || 0), selectedNode.toJSON())
      .run();
  };

  const copyNodeToClipboard = () => {
    editor.chain().setMeta('hideDragHandle', true).setNodeSelection(currentNodePos).run();

    document.execCommand('copy');
  };

  const deleteNode = () => {
    editor
      .chain()
      .setMeta('hideDragHandle', true)
      .setNodeSelection(currentNodePos)
      .deleteSelection()
      .run();
  };

  const handleAdd = () => {
    if (currentNodePos !== -1) {
      const currentNodeSize = currentNode?.nodeSize || 0;
      const insertPos = currentNodePos + currentNodeSize;
      const currentNodeIsEmptyParagraph =
        currentNode?.type.name === 'paragraph' && currentNode?.content?.size === 0;
      const focusPos = currentNodeIsEmptyParagraph ? currentNodePos + 2 : insertPos + 2;

      editor
        .chain()
        .command(({ dispatch, tr, state }) => {
          if (dispatch) {
            if (currentNodeIsEmptyParagraph) {
              tr.insertText('/', currentNodePos, currentNodePos + 1);
            } else {
              tr.insert(
                insertPos,
                state.schema.nodes.paragraph.create(null, [state.schema.text('/')]),
              );
            }

            return dispatch(tr);
          }

          return true;
        })
        .focus(focusPos)
        .run();
    }
  };

  const handleAIContinue = () => {
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      // 润色模式：有选中内容
      const selectedContent = editor.state.doc.textBetween(from, to, '\n\n').trim();

      if (!selectedContent) {
        return;
      }

      const { startLine, endLine } = getSelectionLineRange(editor.state.doc, from, to);

      setDocumentReference({
        fileName: '当前文档',
        startLine: Math.max(1, startLine - 1),
        endLine: Math.max(1, endLine - 1),
        content: selectedContent,
        charCount: selectedContent.length,
      });

      // 设置预设消息 - 润色
      setPresetMessage(
        '请帮我润色上述选中的内容，使其更加流畅、专业、易读。保持原意不变，优化表达方式。',
      );

      // 打开聊天面板并创建新标签页
      setIsOpen(true);
      addTab({
        title: 'AI 润色',
      });
    } else {
      // 续写模式：没有选中内容，获取当前位置之前的内容
      const contentBefore = editor.state.doc.textBetween(0, currentNodePos, '\n\n').trim();

      if (!contentBefore) {
        return;
      }

      // 设置文档引用
      setDocumentReference({
        fileName: '当前文档',
        startLine: 1,
        endLine: Math.max(1, contentBefore.split('\n').length),
        content: contentBefore,
        charCount: contentBefore.length,
      });

      // 设置预设消息 - 续写
      setPresetMessage('请基于上述文档内容，帮我续写后续的内容。保持相同的写作风格和主题。');

      // 打开聊天面板并创建新标签页
      setIsOpen(true);
      addTab({
        title: 'AI 续写',
      });
    }
  };

  return {
    resetTextFormatting,
    duplicateNode,
    copyNodeToClipboard,
    deleteNode,
    handleAdd,
    handleAIContinue,
  };
};

export default useContentItemActions;
