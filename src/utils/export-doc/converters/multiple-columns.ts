import { Paragraph, TextRun } from 'docx';

import { ColumnsNode } from '../types';
import { DocxOptions } from '../option';

/**
 * Options for column layout conversion
 */
export interface ColumnOptions {
  space?: number;
  rows?: number;
  separate?: boolean;
}

/**
 * Convert TipTap columns node to DOCX SectionProperties with column formatting
 *
 * Uses docx section properties to enable native multi-column layout
 *
 * @param node - TipTap columns node
 * @param options - Column options (space, count, separate)
 * @returns Array of SectionProperties with column formatting
 */
export async function convertColumns(
  node: ColumnsNode,
  options: DocxOptions['columns'],
): Promise<any> {
  if (!node.content || node.content.length === 0) {
    return [];
  }

  const space = options?.space ?? 708;
  const count = options?.rows ?? node.content.length;

  // Convert column content
  const columnParagraphs: Paragraph[] = [];

  node.content.forEach((col, columnIndex) => {
    columnParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `gjsdgjlsjglajgajlajglagjlagjal${columnIndex.toString()}` || '',
            shading: {
              type: 'solid',
              color: '00FFFF',
              fill: '000000',
            },
          }),
        ],
      }),
    );
  });

  return {
    properties: {
      column: {
        space,
        count: count,
        // equalWidth: true,
      },
    },
    children: columnParagraphs,
  };
}
