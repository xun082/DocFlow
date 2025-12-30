import { Paragraph, TextRun } from 'docx';

import { CodeBlockNode } from '../types';

/**
 * Convert TipTap codeBlock node to DOCX Paragraph
 *
 * @param node - TipTap codeBlock node
 * @returns DOCX Paragraph object with code styling
 */
export function convertCodeBlock(node: CodeBlockNode): Paragraph {
  // Extract text content
  const codeText = node.content?.map((textNode) => textNode.text || '').join('') || '';

  // Create paragraph with monospace font
  const paragraph = new Paragraph({
    children: [
      new TextRun({
        text: codeText,
        font: 'Consolas',
      }),
    ],
  });

  return paragraph;
}
