import { create } from 'zustand';
import { Editor } from '@tiptap/react';

interface EditorState {
  editor: Editor | null;
  documentId: string | null;
  isContentItemMenuOpen: boolean;
}

interface EditorActions {
  setEditor: (editor: Editor, documentId: string) => void;
  clearEditor: () => void;
  setIsContentItemMenuOpen: (isOpen: boolean) => void;
}

type EditorStore = EditorState & EditorActions;

export const useEditorStore = create<EditorStore>((set) => ({
  // State
  editor: null,
  documentId: null,
  isContentItemMenuOpen: false,

  // Actions
  setEditor: (editor, documentId) => set({ editor, documentId }),
  clearEditor: () => set({ editor: null, documentId: null }),
  setIsContentItemMenuOpen: (isOpen) => set({ isContentItemMenuOpen: isOpen }),
}));
