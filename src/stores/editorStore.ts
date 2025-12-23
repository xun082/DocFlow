import { create } from 'zustand';
import { Editor } from '@tiptap/react';

interface EditorState {
  editor: Editor | null;
  documentId: string | null;
}

interface EditorActions {
  setEditor: (editor: Editor, documentId: string) => void;
  clearEditor: () => void;
}

type EditorStore = EditorState & EditorActions;

export const useEditorStore = create<EditorStore>((set) => ({
  // State
  editor: null,
  documentId: null,

  // Actions
  setEditor: (editor, documentId) => set({ editor, documentId }),
  clearEditor: () => set({ editor: null, documentId: null }),
}));
