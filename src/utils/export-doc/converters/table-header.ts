import { TableCell } from 'docx';

import { TableHeaderNode } from '../types';
import { convertParagraph } from './paragraph';
import { DocxOptions } from '../option';

/**
 * Convert TipTap table header node to DOCX TableCell
 *
 * @param node - TipTap table header node
 * @param options - Table options from PropertiesOptions
 * @returns DOCX TableCell object for header
 */
export function convertTableHeader(
  node: TableHeaderNode,
  options: DocxOptions['table'],
): TableCell {
  // Convert paragraphs in the header
  const paragraphs =
    node.content?.map((p) =>
      convertParagraph(
        p,
        options?.header?.paragraph ??
          options?.cell?.paragraph ??
          options?.row?.paragraph ??
          options?.paragraph,
      ),
    ) || [];

  // Create table header cell with header options
  const headerCell = new TableCell({
    children: paragraphs,
    ...options?.header?.run,
  });

  // Add column span if present
  if (node.attrs?.colspan && node.attrs.colspan > 1) {
    Object.assign(headerCell.options, { columnSpan: node.attrs.colspan });
  }

  // Add row span if present
  if (node.attrs?.rowspan && node.attrs.rowspan > 1) {
    Object.assign(headerCell.options, { rowSpan: node.attrs.rowspan });
  }

  // Add column width if present
  if (node.attrs?.colwidth !== null && node.attrs?.colwidth !== undefined) {
    Object.assign(headerCell.options, {
      width: {
        size: node.attrs.colwidth,
        type: 'dxa' as const,
      },
    });
  }

  if (!headerCell.options.width) {
    Object.assign(headerCell.options, {
      width: {
        size: 2000, // Default width of about 1.4 inches (2000/1440)
        type: 'dxa' as const,
      },
    });
  }

  return headerCell;
}
