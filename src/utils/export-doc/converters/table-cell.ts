import { TableCell } from 'docx';

import { ImageNode, ParagraphNode, TableCellNode } from '../types';
import { convertParagraph } from './paragraph';
import { convertImage } from './image';
import { DocxOptions } from '../option';

/**
 * Convert TipTap table cell node to DOCX TableCell
 *
 * @param node - TipTap table cell node
 * @param options - Table options from PropertiesOptions
 * @returns DOCX TableCell object
 */
export async function convertTableCell(
  node: TableCellNode,
  options: DocxOptions['table'],
): Promise<TableCell> {
  // Convert paragraphs in the cell
  const paragraphs =
    (await Promise.all(
      node.content?.map(async (p) => {
        // Handle image nodes
        if (['image', 'tableImage'].includes(p.type)) {
          const [width, height] = p.attrs?.size?.split('x') || [100, 100];

          //  防止图片过大
          return convertImage(
            {
              ...p,
              attrs: {
                ...p.attrs,
                width: width > 1000 ? width * 0.4 : 100,
                height: height > 1000 ? height * 0.4 : 100,
              },
            } as ImageNode,
            undefined,
          );
        } else {
          // Handle paragraph nodes
          return convertParagraph(
            p as ParagraphNode,
            options?.cell?.paragraph ?? options?.row?.paragraph ?? options?.paragraph,
          );
        }
      }) || [],
    )) || [];

  // Create table cell with options
  const cell = new TableCell({
    children: paragraphs,
    ...options?.cell?.run,
  });

  // console.log('🚀 ~ file: table-cell.ts:39 ~ paragraphs:', paragraphs);

  // Add column span if present
  if (node.attrs?.colspan && node.attrs.colspan > 1) {
    Object.assign(cell.options, { columnSpan: node.attrs.colspan });
  }

  // Add row span if present
  if (node.attrs?.rowspan && node.attrs.rowspan > 1) {
    Object.assign(cell.options, { rowSpan: node.attrs.rowspan });
  }

  // Add column width if present
  if (node.attrs?.colwidth !== null && node.attrs?.colwidth !== undefined) {
    Object.assign(cell.options, {
      width: {
        size: node.attrs.colwidth,
        type: 'dxa' as const,
      },
    });
  }

  if (!cell.options.width) {
    Object.assign(cell.options, {
      width: {
        size: 2000, // Default width of about 1.4 inches (2000/1440)
        type: 'dxa' as const,
      },
    });
  }

  return cell;
}
