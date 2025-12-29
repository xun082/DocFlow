import { Paragraph, ImageRun, IImageOptions, TextRun } from 'docx';
import { imageMeta as getImageMetadata, type ImageMeta } from 'image-meta';

import { ImageNode } from '../types';
import { getImageTypeFromSrc, getImageWidth, getImageHeight, getImageDataAndMeta } from '../utils';
import { DocxOptions } from '../option';

/**
 * Convert TipTap image node to DOCX Paragraph with ImageRun
 *
 * @param node - TipTap image node
 * @param options - Image options from PropertiesOptions
 * @returns Promise<DOCX Paragraph> object with image
 */
export async function convertImage(
  node: ImageNode,
  options: DocxOptions['image'],
): Promise<Paragraph> {
  // Get image type from metadata or URL
  const getImageType = (metaType?: string): 'jpg' | 'png' | 'gif' | 'bmp' => {
    // Try metadata type first
    switch (metaType) {
      case 'jpeg':
      case 'jpg':
        return 'jpg';
      case 'png':
        return 'png';
      case 'gif':
        return 'gif';
      case 'bmp':
        return 'bmp';
      case 'webp':
        return 'png';
    }

    // Fallback to URL-based type detection
    const type = getImageTypeFromSrc(node.attrs?.src || '');

    switch (type) {
      case 'jpeg':
        return 'jpg';
      case 'png':
        return 'png';
      case 'gif':
        return 'gif';
      case 'bmp':
        return 'bmp';
      case 'webp':
        return 'png';
      default:
        return 'png';
    }
  };

  // Get image data and metadata
  let imageData: Uint8Array;
  let imageMeta: ImageMeta;

  try {
    const src = node.attrs?.src || '';

    if (src.startsWith('http')) {
      const result = await getImageDataAndMeta(src);
      imageData = result.data;
      imageMeta = result.meta;
    } else if (src.startsWith('data:')) {
      // Handle data URLs - extract the base64 part
      const base64Data = src.split(',')[1];
      // Use TextEncoder to create Uint8Array from base64 (works in both Node and browser)
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      imageData = bytes;

      // Extract metadata from data URL
      try {
        imageMeta = getImageMetadata(imageData);
      } catch {
        imageMeta = {
          type: 'png',
          width: undefined,
          height: undefined,
          orientation: undefined,
        };
      }
    } else {
      throw new Error(`Unsupported image source format: ${src.substring(0, 20)}...`);
    }
  } catch (error) {
    console.warn(`Failed to process image:`, error);

    // Create placeholder paragraph
    return new Paragraph({
      children: [new TextRun({ text: '图片加载失败', color: 'FF0000' })],
    });
  }

  // Determine final dimensions using utils functions: first width, then height based on aspect ratio
  const finalWidth = getImageWidth(node, options, imageMeta);
  const finalHeight = getImageHeight(node, finalWidth, options, imageMeta);

  // Build complete image options
  const imageOptions: IImageOptions = {
    type: getImageType(imageMeta.type),
    data: imageData,
    transformation: {
      width: finalWidth,
      height: finalHeight,
    },
    altText: {
      name: node.attrs?.alt || '',
      description: undefined,
      title: node.attrs?.title || undefined,
    },
    ...(options?.run &&
      options.run.floating && {
        floating: options.run.floating,
      }),
    ...(options?.run &&
      options.run.outline && {
        outline: options.run.outline,
      }),
  };

  // Create image run
  const imageRun = new ImageRun(imageOptions);

  // Create paragraph with image
  const paragraphOptions = options?.paragraph || {};
  const paragraph = new Paragraph({
    children: [imageRun],
    ...paragraphOptions, // Allow override of paragraph properties
  });

  return paragraph;
}
