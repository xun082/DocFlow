import { Paragraph } from "docx";
import { convertText, convertHardBreak } from "./text";
import { BlockquoteNode } from "../types";

/**
 * Convert TipTap blockquote node to array of DOCX Paragraphs
 * Each paragraph in blockquote is indented and styled
 *
 * @param node - TipTap blockquote node
 * @returns Array of DOCX Paragraph objects
 */
export function convertBlockquote(node: BlockquoteNode): Paragraph[] {
  if (!node.content) return [];

  return node.content.map((contentNode) => {
    if (contentNode.type === "paragraph") {
      // Convert paragraph content
      const children =
        contentNode.content?.flatMap((node) => {
          if (node.type === "text") {
            return convertText(node);
          } else if (node.type === "hardBreak") {
            return convertHardBreak();
          }
          return [];
        }) || [];

      // Create indented paragraph for blockquote
      const paragraph = new Paragraph({
        children,
        indent: {
          left: 720,
        },
        border: {
          left: {
            style: "single",
          },
        },
      });

      return paragraph;
    }

    // Handle other content types within blockquote
    // For now, return empty paragraph as fallback
    return new Paragraph({});
  });
}
