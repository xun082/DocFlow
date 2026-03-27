import { Node } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';

import { useChatStore } from '@/stores/chatStore';

const useContentItemActions = (
  editor: Editor,
  currentNode: Node | null,
  currentNodePos: number,
) => {
  const { setIsOpen } = useChatStore();

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

  /** 打开 AI 编辑面板，让用户在面板中输入指令 */
  const handleAIContinue = () => {
    setIsOpen(true);
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
