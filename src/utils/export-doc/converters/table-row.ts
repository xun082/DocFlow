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
export async function convertTableRow(
  node: TableRowNode,
  options: DocxOptions['table'],
): Promise<TableRow> {
  // Choose row options
  const rowOptions = options?.row;

  // Convert table cells and headers
  const cells =
    (await Promise.all(
      node.content?.flatMap(async (cellNode) => {
        if (cellNode.type === 'tableCell') {
          return convertTableCell(cellNode, options);
        } else if (cellNode.type === 'tableHeader') {
          return await convertTableHeader(cellNode, options);
        }

        return [];
      }) || [],
    )) || [];

  // Create table row with options
  const row = new TableRow({
    children: cells.flat(),
    ...rowOptions,
  });

  return row;
}
