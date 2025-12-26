import { Paragraph, IParagraphOptions } from 'docx';

import { convertText, convertHardBreak } from './text';
import { ParagraphNode } from '../types';

/**
 * Convert TipTap paragraph node to DOCX Paragraph
 *
 * @param node - TipTap paragraph node
 * @param options - Optional paragraph options (e.g., numbering)
 * @returns DOCX Paragraph object
 */
export function convertParagraph(node: ParagraphNode, options?: IParagraphOptions): Paragraph {
  // Convert content to text runs
  const children =
    node.content?.flatMap((contentNode) => {
      if (contentNode.type === 'text') {
        return convertText(contentNode);
      } else if (contentNode.type === 'hardBreak') {
        return convertHardBreak();
      }

      return [];
    }) || [];

  // Create paragraph with options
  const paragraphOptions: IParagraphOptions = {
    children,
    ...options,
  };

  return new Paragraph(paragraphOptions);
}
