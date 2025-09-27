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

  // 新增：提取指定位置之前的内容
  const extractContentBeforePosition = (beforePos: number): string => {
    const textContents: string[] = [];

    editor.state.doc.descendants((node, pos) => {
      // 如果当前节点的位置已经超过了目标位置，停止遍历
      if (pos >= beforePos) {
        return false;
      }

      // 只处理段落节点且有文本内容
      if (node.type.name === 'paragraph' && node.textContent?.trim()) {
        // 检查段落是否完全在目标位置之前
        const nodeEnd = pos + node.nodeSize;

        if (nodeEnd <= beforePos) {
          textContents.push(node.textContent.trim());
        } else {
          // 如果段落跨越了目标位置，只取前面的部分
          const textBeforePos = node.textContent.substring(0, beforePos - pos - 1);

          if (textBeforePos.trim()) {
            textContents.push(textBeforePos.trim());
          }
        }
      }

      return true;
    });

    return textContents.join('\n');
  };

  const buildContentString = (prompt: string, op?: string, aiNodePos?: number): string => {
    let baseContent: string;

    if (op === 'continue' && aiNodePos !== undefined) {
      // 续写模式：只获取AI节点位置之前的内容
      baseContent = extractContentBeforePosition(aiNodePos);
    } else {
      // 其他模式：获取全部内容
      baseContent = extractTextContent();
    }

    return op === 'continue' ? baseContent : baseContent + '\n' + prompt;
  };

  return {
    extractTextContent,
    extractContentBeforePosition,
    buildContentString,
  };
};
