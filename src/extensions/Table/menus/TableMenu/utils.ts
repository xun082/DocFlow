import { Editor } from '@tiptap/react';
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';

import { isTableSelected as isTableSelectedUtil } from '../../utils';
import { Table } from '../..';

export const isTableMenuSelected = ({
  editor,
  state,
}: {
  editor: Editor;
  view: EditorView;
  state: EditorState;
}) => {
  if (!editor.isActive(Table.name) || isTableSelectedUtil(state.selection)) {
    return false;
  }

  return true;
};

export default isTableMenuSelected;
