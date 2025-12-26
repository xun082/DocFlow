import { TableRow } from 'docx';

import { TableRowNode } from '../types';
import { convertTableCell } from './table-cell';
import { convertTableHeader } from './table-header';
import { DocxOptions } from '../option';

/**
 * Convert TipTap table row node to DOCX TableRow
 *
 * @param node - TipTap table row node
 * @param options - Table options from PropertiesOptions
 * @returns DOCX TableRow object
 */
export function convertTableRow(node: TableRowNode, options: DocxOptions['table']): TableRow {
  // Choose row options
  const rowOptions = options?.row;

  // Convert table cells and headers
  const cells =
    node.content?.flatMap((cellNode) => {
      if (cellNode.type === 'tableCell') {
        return convertTableCell(cellNode, options);
      } else if (cellNode.type === 'tableHeader') {
        return convertTableHeader(cellNode, options);
      }

      return [];
    }) || [];

  // Create table row with options
  const row = new TableRow({
    children: cells,
    ...rowOptions,
  });

  return row;
}
