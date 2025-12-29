import { JSONContent } from '@tiptap/core';
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  OutputType,
  OutputByType,
  INumberingOptions,
  ILevelsOptions,
  IPropertiesOptions,
  FileChild,
  LevelFormat,
  AlignmentType,
  convertInchesToTwip,
  TableOfContents,
} from 'docx';

import { type DocxOptions } from './option';
import { convertParagraph } from './converters/paragraph';
import { convertHeading } from './converters/heading';
import { convertBlockquote } from './converters/blockquote';
import { convertImage } from './converters/image';
import { convertTable } from './converters/table';
import { convertCodeBlock } from './converters/code-block';
import { convertList } from './converters/list';
import { convertListItem } from './converters/list-item';
import { convertTaskList } from './converters/task-list';
import { convertTaskItem } from './converters/task-item';
import { convertHorizontalRule } from './converters/horizontal-rule';
import { convertDetails } from './converters/details';
import { convertHardBreak } from './converters/text';
import type {
  ParagraphNode,
  HeadingNode,
  BlockquoteNode,
  CodeBlockNode,
  ImageNode,
  TableNode,
  TaskListNode,
  ListItemNode,
  TaskItemNode,
  OrderedListNode,
  BulletListNode,
  HorizontalRuleNode,
  DetailsNode,
} from './types';

/**
 * Convert TipTap JSONContent to DOCX format
 *
 * @param docJson - TipTap document JSON
 * @param options - Options for document properties
 * @returns Promise with DOCX in specified format
 */
export async function generateDOCX<T extends OutputType>(
  docJson: JSONContent,
  options: DocxOptions<T>,
): Promise<OutputByType[T]> {
  const {
    // Document metadata
    title,
    subject,
    creator,
    keywords,
    description,
    lastModifiedBy,
    revision,

    // Document styling
    styles,

    // Table of contents
    tableOfContents,

    // Document options
    sections,
    fonts,
    hyphenation,
    compatibility,
    customProperties,
    evenAndOddHeaderAndFooters,
    defaultTabStop,

    // Export options
    outputType,
  } = options;

  // Convert document content
  const children = await convertDocumentContent(docJson, options);

  // Create table of contents if configured
  const tocElement = tableOfContents
    ? new TableOfContents(tableOfContents.title, {
        ...tableOfContents.run,
      })
    : null;

  // Collect ordered list start values for numbering options
  const numberingOptions = createNumberingOptions(docJson);

  // Build document sections - merge user config with generated content
  const documentSections = sections
    ? sections.map((section, index) => {
        const sectionChildren: FileChild[] = [];

        // Add table of contents to first section if configured
        if (index === 0 && tocElement) {
          sectionChildren.push(tocElement);
        }

        // Add main content to first section
        if (index === 0) {
          sectionChildren.push(...children);
        }

        return {
          ...section,
          ...(sectionChildren.length > 0 ? { children: sectionChildren } : {}),
        };
      })
    : [
        {
          children: tocElement ? [tocElement, ...children] : children,
        },
      ];

  // Build document options
  const docOptions: IPropertiesOptions = {
    // Sections - required
    sections: documentSections,

    // Metadata
    title: title || 'Document',
    subject: subject || '',
    creator: creator || '',
    keywords: keywords || '',
    description: description || '',
    lastModifiedBy: lastModifiedBy || '',
    revision: revision || 1,

    // Styling
    styles,
    numbering: numberingOptions,
  };

  // Add optional properties only if provided
  if (fonts && fonts.length > 0) {
    Object.assign(docOptions, { fonts });
  }

  if (hyphenation) {
    Object.assign(docOptions, { hyphenation });
  }

  if (compatibility) {
    Object.assign(docOptions, { compatibility });
  }

  if (customProperties && customProperties.length > 0) {
    Object.assign(docOptions, { customProperties });
  }

  if (evenAndOddHeaderAndFooters !== undefined) {
    Object.assign(docOptions, { evenAndOddHeaderAndFooters });
  }

  if (defaultTabStop !== undefined) {
    Object.assign(docOptions, { defaultTabStop });
  }

  const doc = new Document(docOptions);

  return Packer.pack(doc, outputType || 'arraybuffer') as Promise<OutputByType[T]>;
}

/**
 * Convert document content to DOCX elements
 */
export async function convertDocumentContent(
  node: JSONContent,
  options: DocxOptions,
): Promise<FileChild[]> {
  const elements: FileChild[] = [];

  if (!node || !Array.isArray(node.content)) {
    return elements;
  }

  for (const childNode of node.content) {
    const element = await convertNode(childNode, options);

    if (Array.isArray(element)) {
      elements.push(...element);
    } else if (element) {
      elements.push(element);
    }
  }

  return elements;
}

/**
 * Convert a single node to DOCX element(s)
 */
export async function convertNode(
  node: JSONContent,
  options: DocxOptions,
): Promise<FileChild | FileChild[] | null> {
  if (!node || !node.type) {
    return null;
  }

  switch (node.type) {
    case 'paragraph':
      return convertParagraph(node as ParagraphNode);

    case 'heading':
      return convertHeading(node as HeadingNode);

    case 'blockquote':
      return convertBlockquote(node as BlockquoteNode);

    case 'codeBlock':
      return convertCodeBlock(node as CodeBlockNode);

    case 'image':
      return await convertImage(node as ImageNode, options.image);

    case 'table':
      return await convertTable(node as TableNode, options.table);

    case 'bulletList':
      return convertList(node as BulletListNode, 'bullet');

    case 'orderedList':
      return convertList(node as OrderedListNode, 'ordered');

    case 'taskList':
      return convertTaskList(node as TaskListNode);

    case 'listItem':
      return convertListItem(node as ListItemNode);

    case 'taskItem':
      return convertTaskItem(node as TaskItemNode);

    case 'hardBreak':
      // Wrap hardBreak in a paragraph
      return new Paragraph({ children: [convertHardBreak()] });

    case 'horizontalRule':
      return convertHorizontalRule(node as HorizontalRuleNode, options.horizontalRule);

    case 'details':
      return await convertDetails(node as DetailsNode, options);

    default:
      // Unknown node type, return a paragraph with text
      return new Paragraph({
        children: [new TextRun({ text: `[Unsupported: ${node.type}]` })],
      });
  }
}

/**
 * Create numbering options for the document
 */
function createNumberingOptions(docJson: JSONContent): INumberingOptions {
  // Collect all unique ordered list start values
  const orderedListStarts = new Set<number>();

  function collectListStarts(node: JSONContent) {
    if (node.type === 'orderedList' && node.attrs?.start) {
      orderedListStarts.add(node.attrs.start);
    }

    if (node.content) {
      for (const child of node.content) {
        collectListStarts(child);
      }
    }
  }

  collectListStarts(docJson);

  // Build numbering options
  const options: ILevelsOptions[] = [
    // Bullet list options
    {
      level: 0,
      format: LevelFormat.BULLET,
      text: '•',
      alignment: AlignmentType.START,
      style: {
        paragraph: {
          indent: {
            left: convertInchesToTwip(0.5),
            hanging: convertInchesToTwip(0.25),
          },
        },
      },
    },
    // Default ordered list options (starts at 1)
    {
      level: 0,
      format: LevelFormat.DECIMAL,
      text: '%1.',
      alignment: AlignmentType.START,
      style: {
        paragraph: {
          indent: {
            left: convertInchesToTwip(0.5),
            hanging: convertInchesToTwip(0.25),
          },
        },
      },
    },
  ];

  // Create the final numbering options
  const numberingOptions: Array<{
    reference: string;
    levels: ILevelsOptions[];
  }> = [
    {
      reference: 'bullet-list',
      levels: [options[0]],
    },
    {
      reference: 'ordered-list',
      levels: [options[1]], // Use the decimal options
    },
  ];

  // Add options for custom start values
  for (const start of orderedListStarts) {
    if (start !== 1) {
      numberingOptions.push({
        reference: `ordered-list-start-${start}`,
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.START,
            start,
            style: {
              paragraph: {
                indent: {
                  left: convertInchesToTwip(0.5),
                  hanging: convertInchesToTwip(0.25),
                },
              },
            },
          },
        ],
      });
    }
  }

  return { config: numberingOptions };
}
