import { Paragraph, IParagraphOptions } from 'docx';

import { convertText, convertHardBreak } from './text';
import { ParagraphNode } from '../types';
import { convertEmoji } from './emoji';

/**
 * Convert TipTap paragraph node to DOCX Paragraph
 *
 * @param node - TipTap paragraph node
 * @param options - Optional paragraph options (e.g., numbering)
 * @returns DOCX Paragraph object
 */
export async function convertParagraph(
  node: ParagraphNode,
  options?: IParagraphOptions,
): Promise<Paragraph> {
  // Convert content to text runs
  const childrenPromises =
    node.content?.map(async (contentNode) => {
      if (contentNode.type === 'text') {
        return convertText(contentNode);
      } else if (contentNode.type === 'hardBreak') {
        return convertHardBreak();
      } else if (contentNode.type === 'emoji') {
        return await convertEmoji(contentNode);
      }

      return null;
    }) || [];

  // Wait for all conversions to complete
  const children = (await Promise.all(childrenPromises)).filter(
    (child): child is Exclude<typeof child, null> => child !== null,
  );

  // Create paragraph with options
  const paragraphOptions: IParagraphOptions = {
    children,
    ...options,
  };

  return new Paragraph(paragraphOptions);
}
