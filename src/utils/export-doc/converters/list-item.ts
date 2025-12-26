import { Paragraph, IParagraphOptions } from 'docx';

import { ListItemNode } from '../types';
import { convertParagraph } from './paragraph';

/**
 * Convert TipTap list item node to DOCX Paragraph
 *
 * Note: The numbering reference (including start value) is typically
 * handled by the parent list converter. This function focuses on
 * converting the paragraph content of the list item.
 *
 * @param node - TipTap list item node
 * @param options - Optional paragraph options (e.g., numbering)
 * @returns DOCX Paragraph object
 */
export function convertListItem(node: ListItemNode, options?: IParagraphOptions): Paragraph {
  if (!node.content || node.content.length === 0) {
    return new Paragraph({});
  }

  // Convert the first paragraph in the list item
  const firstParagraph = node.content[0];

  if (firstParagraph.type === 'paragraph') {
    return convertParagraph(firstParagraph, options);
  }

  // Fallback to empty paragraph
  return new Paragraph({});
}
