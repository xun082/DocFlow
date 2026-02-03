import { Paragraph } from 'docx';

import { convertText, convertHardBreak } from './text';
import { convertNode } from '../generator';
import { DetailsNode, DetailsSummaryNode, DetailsContentNode } from '../types';
import type { DocxOptions } from '../option';

/**
 * Convert TipTap details node to array of DOCX Paragraphs
 * Simulates collapsible content using indentation and borders
 *
 * @param node - TipTap details node
 * @param options - Docx options for nested content conversion
 * @returns Array of DOCX Paragraph objects
 */
export async function convertDetails(
  node: DetailsNode,
  options: DocxOptions,
): Promise<Paragraph[]> {
  if (!node.content) return [];

  const result: Paragraph[] = [];
  let summaryNode: DetailsSummaryNode | undefined;
  let contentNode: DetailsContentNode | undefined;

  // Find summary and content nodes
  for (const child of node.content) {
    if (child.type === 'detailsSummary') {
      summaryNode = child;
    } else if (child.type === 'detailsContent') {
      contentNode = child;
    }
  }

  // Convert summary (summary-style paragraph with border)
  if (summaryNode?.content) {
    const summaryChildren = summaryNode.content.flatMap((textNode) => {
      if (textNode.type === 'text') {
        return convertText(textNode);
      } else if (textNode.type === 'hardBreak') {
        return convertHardBreak();
      }

      return [];
    });

    const summaryParagraph = new Paragraph({
      children: summaryChildren,
      ...options.details?.summary?.paragraph,
    });

    result.push(summaryParagraph);
  }

  // Convert content (indented paragraphs and other elements)
  if (contentNode?.content) {
    for (const contentElement of contentNode.content) {
      const element = await convertNode(contentElement, options);

      if (Array.isArray(element)) {
        result.push(...(element as Paragraph[]));
      } else if (element) {
        result.push(element as Paragraph);
      }
    }
  }

  return result;
}
