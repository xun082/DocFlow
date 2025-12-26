import { Paragraph, TextRun } from "docx";
import { TaskItemNode } from "../types";
import { convertText, convertHardBreak } from "./text";

/**
 * Convert TipTap task item node to DOCX Paragraph with checkbox
 *
 * @param node - TipTap task item node
 * @returns DOCX Paragraph object with checkbox
 */
export function convertTaskItem(node: TaskItemNode): Paragraph {
  if (!node.content || node.content.length === 0) {
    return new Paragraph({});
  }

  // Convert the first paragraph in the task item
  const firstParagraph = node.content[0];
  if (firstParagraph.type === "paragraph") {
    // Add checkbox based on checked state
    const isChecked = node.attrs?.checked || false;
    const checkboxText = isChecked ? "☑ " : "☐ ";

    // Convert paragraph content to text runs
    const children =
      firstParagraph.content?.flatMap((contentNode) => {
        if (contentNode.type === "text") {
          return convertText(contentNode);
        } else if (contentNode.type === "hardBreak") {
          return convertHardBreak();
        }
        return [];
      }) || [];

    // Add checkbox as first text run
    const checkboxRun = new TextRun({ text: checkboxText });

    return new Paragraph({
      children: [checkboxRun, ...children],
    });
  }

  // Fallback to empty paragraph
  return new Paragraph({});
}
