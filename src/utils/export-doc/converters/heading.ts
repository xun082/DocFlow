import { Paragraph, HeadingLevel } from "docx";
import { HeadingNode } from "../types";
import { convertText, convertHardBreak } from "./text";

/**
 * Convert TipTap heading node to DOCX paragraph
 *
 * @param node - TipTap heading node
 * @returns DOCX Paragraph object
 */
export function convertHeading(node: HeadingNode): Paragraph {
  // Get heading level
  const level: HeadingNode["attrs"]["level"] = node?.attrs?.level;

  // Convert content using shared text converter
  const children =
    node.content?.flatMap((contentNode) => {
      if (contentNode.type === "text") {
        return convertText(contentNode);
      } else if (contentNode.type === "hardBreak") {
        return convertHardBreak();
      }
      return [];
    }) || [];

  // Map to DOCX heading levels
  const headingMap: Record<
    HeadingNode["attrs"]["level"],
    (typeof HeadingLevel)[keyof typeof HeadingLevel]
  > = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  // Create heading paragraph
  const paragraph = new Paragraph({
    children,
    heading: headingMap[level],
  });

  return paragraph;
}
