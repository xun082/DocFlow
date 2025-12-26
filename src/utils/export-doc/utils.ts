/**
 * Shared utility functions for the export-docx package
 */

import { imageMeta as getImageMetadata, type ImageMeta } from 'image-meta';
import { ofetch } from 'ofetch';

/**
 * Extract image type from URL or base64 data
 */
export function getImageTypeFromSrc(src: string): 'png' | 'jpeg' | 'gif' | 'bmp' | 'tiff' | 'webp' {
  if (src.startsWith('data:')) {
    const match = src.match(/data:image\/(\w+);/);

    if (match) {
      const type = match[1].toLowerCase();

      switch (type) {
        case 'jpg':
        case 'jpeg':
          return 'jpeg';
        case 'png':
          return 'png';
        case 'gif':
          return 'gif';
        case 'bmp':
          return 'bmp';
        case 'tiff':
          return 'tiff';
        case 'webp':
          return 'webp';
        default:
          return 'png';
      }
    }
  } else {
    const extension = src.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'gif':
        return 'gif';
      case 'bmp':
        return 'bmp';
      case 'tiff':
        return 'tiff';
      case 'webp':
        return 'webp';
      default:
        return 'png';
    }
  }

  return 'png';
}

/**
 * Create floating options for full-width images
 */
export function createFloatingOptions() {
  return {
    horizontalPosition: {
      relative: 'page',
      align: 'center',
    },
    verticalPosition: {
      relative: 'page',
      align: 'top',
    },
    lockAnchor: true,
    behindDocument: false,
    inFrontOfText: false,
  };
}

/**
 * Get image width with clear priority: node attrs > options.run > image metadata > default
 */
export function getImageWidth(
  node: { attrs?: { width?: number | null } },
  options?: { run?: { transformation?: { width?: number } } },
  imageMeta?: { width?: number | null },
): number {
  if (node.attrs?.width && typeof node.attrs.width === 'number') {
    return node.attrs.width;
  }

  if (options?.run?.transformation?.width) {
    return options.run.transformation.width;
  }

  if (imageMeta?.width && typeof imageMeta.width === 'number') {
    const width = Math.min(imageMeta.width, 600);

    // 如果图片太小，使用默认尺寸
    return width < 50 ? 400 : width;
  }

  return 400;
}

/**
 * Get image height with clear priority: node attrs > options.run > calculated > default
 */
export function getImageHeight(
  node: { attrs?: { height?: number | null } },
  width: number,
  options?: { run?: { transformation?: { height?: number } } },
  imageMeta?: { width?: number | null; height?: number | null },
): number {
  if (node.attrs?.height && typeof node.attrs.height === 'number') {
    return node.attrs.height;
  }

  if (options?.run?.transformation?.height) {
    return options.run.transformation.height;
  }

  if (
    imageMeta?.width &&
    typeof imageMeta.width === 'number' &&
    imageMeta?.height &&
    typeof imageMeta.height === 'number'
  ) {
    const height = Math.round((width * imageMeta.height) / imageMeta.width);

    // 如果计算出的高度太小，使用默认尺寸
    return height < 50 ? 300 : height;
  }

  return 300;
}

/**
 * Fetch image data and metadata from URL
 */
export async function getImageDataAndMeta(
  url: string,
): Promise<{ data: Uint8Array; meta: ImageMeta }> {
  try {
    // Use ofetch to get binary data with responseType: "blob"
    const blob = await ofetch(url, {
      responseType: 'blob',
      redirect: 'follow',
      timeout: 30000,
    });
    const arrayBuffer = await blob.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Get image metadata using image-meta
    let meta: ImageMeta;

    try {
      meta = getImageMetadata(data);
    } catch (error) {
      // If metadata extraction fails, use default values
      console.warn(`Failed to extract image metadata:`, error);
      meta = {
        width: undefined,
        height: undefined,
        type: getImageTypeFromSrc(url) || 'png',
        orientation: undefined,
      };
    }

    return { data, meta };
  } catch (error) {
    console.warn(`Failed to fetch image from ${url}:`, error);
    throw error;
  }
}
