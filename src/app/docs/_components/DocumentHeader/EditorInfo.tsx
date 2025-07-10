import { memo } from 'react';
import { Editor } from '@tiptap/react';

interface EditorInfoProps {
  editor: Editor;
}

export const EditorInfo = memo(({ editor }: EditorInfoProps) => {
  const characters = editor.storage.characterCount?.characters() || 0;
  const words = editor.storage.characterCount?.words() || 0;

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
      <span>{characters} 字符</span>
      <span>{words} 词</span>
    </div>
  );
});

EditorInfo.displayName = 'EditorInfo';
