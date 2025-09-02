import { Editor } from '@tiptap/core';

export const useTextExtraction = (editor: Editor) => {
  const extractTextContent = (): string => {
    const textContents: string[] = [];

    editor.state.doc.descendants((node) => {
      if (node.type.name === 'paragraph' && node.textContent?.trim()) {
        textContents.push(node.textContent?.trim());
      }

      return true;
    });

    return textContents.join('\n');
  };

  const buildContentString = (prompt: string, op?: string): string => {
    const baseContent = extractTextContent();

    return op === 'continue' ? baseContent : baseContent + '\n' + prompt;
  };

  return {
    extractTextContent,
    buildContentString,
  };
};
