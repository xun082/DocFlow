import { Paragraph, TextRun } from 'docx';

import { MathNode } from '../types';
// import { DocxOptions } from '../option';

/**
 * Convert TipTap math node to DOCX Paragraph
 *
 * Since DOCX doesn't natively support mathematical formulas,
 * we render them as text with monospace font to preserve the LaTeX format.
 * Users can copy the LaTeX code and use it in other tools.
 *
 * @param node - TipTap math node (inlineMath or blockMath)
 * @param options - Document options
 * @returns DOCX Paragraph object with math formula as text
 */
export function convertMath(node: MathNode): Paragraph {
  const mathText = node.attrs?.text || '';
  const isInline = node.type === 'inlineMath';

  // Create text run with monospace font for LaTeX code
  const textRun = new TextRun({
    text: mathText,
    font: 'Courier New',
    size: 20, // 10pt in half-points
    italics: true, // Math formulas are typically italicized
  });

  // For inline math, return a paragraph with the formula
  // For block math, return a centered paragraph with spacing
  if (isInline) {
    return new Paragraph({
      children: [textRun],
      spacing: {
        before: 0,
        after: 0,
      },
    });
  } else {
    // Block math formula - centered with spacing
    return new Paragraph({
      children: [textRun],
      alignment: 'center',
      spacing: {
        before: 120, // 6pt spacing before
        after: 120, // 6pt spacing after
      },
    });
  }
}
