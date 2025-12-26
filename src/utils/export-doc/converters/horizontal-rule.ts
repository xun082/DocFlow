import { Paragraph, BorderStyle } from "docx";
import { HorizontalRuleNode } from "../types";
import type { DocxOptions } from "../option";

/**
 * Convert TipTap horizontalRule node to DOCX Paragraph
 * Creates a horizontal line using bottom border
 *
 * @param node - TipTap horizontalRule node
 * @param options - Docx options for horizontal rule styling
 * @returns DOCX Paragraph object with horizontal rule styling
 */
export function convertHorizontalRule(
  node: HorizontalRuleNode,
  options: DocxOptions["horizontalRule"],
): Paragraph {
  return new Paragraph({
    children: [], // Empty content
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "auto",
      },
    },
    ...options?.paragraph,
  });
}
