import { Table, Paragraph, ITableOptions } from 'docx';

import { TableNode } from '../types';
import { convertTableRow } from './table-row';
import { DocxOptions } from '../option';

/**
 * Convert TipTap table node to DOCX Table
 *
 * @param node - TipTap table node
 * @param options - Table options from PropertiesOptions
 * @returns Array containing Table and a following Paragraph to prevent merging
 */
export async function convertTable(
  node: TableNode,
  options: DocxOptions['table'],
): Promise<Array<Table | Paragraph>> {
  // Convert table rows
  const rows =
    (await Promise.all(node.content?.map((row) => convertTableRow(row, options)) || [])) || [];

  // Build table options with options
  const tableOptions: ITableOptions = {
    rows,
    // Set default table width if not specified
    width: {
      size: options?.run?.width?.size || 100,
      type: options?.run?.width?.type || 'pct',
    },
    // Use fixed layout to ensure cell widths are respected
    // This is important when we set specific widths on cells
    layout: options?.run?.layout || 'fixed',
    ...options?.run, // Apply table options
  };

  // Create table
  const table = new Table(tableOptions);

  // Return table with a following empty paragraph to prevent automatic merging with adjacent tables
  return [table, new Paragraph({})];
}
