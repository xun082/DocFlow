/**
 * File upload utilities
 */

import { formatFileSize } from '../format/file-size';

// Re-export formatting functions from format module
export { formatSpeed, formatTime, formatFileSize } from '../format/file-size';

/**
 * Sanitize file name by removing special characters
 * @param fileName - Original file name
 * @returns Sanitized file name
 */
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9\u4e00-\u9fff.\-_]/g, '_');
}

/**
 * Generate unique file ID from hash
 * @param fileHash - File hash string
 * @returns Unique file ID
 */
export function generateFileId(fileHash: string): string {
  return `${fileHash.substring(0, 10)}-${Date.now()}`;
}

/**
 * Calculate number of chunks for file
 * @param fileSize - Total file size
 * @param chunkSize - Size of each chunk
 * @returns Number of chunks
 */
export function calculateChunkCount(fileSize: number, chunkSize: number): number {
  return Math.ceil(fileSize / chunkSize);
}

/**
 * Get chunk range for specific chunk number
 * @param chunkNumber - Chunk index
 * @param chunkSize - Size of each chunk
 * @param fileSize - Total file size
 * @returns Chunk range information
 */
export function getChunkRange(
  chunkNumber: number,
  chunkSize: number,
  fileSize: number,
): { start: number; end: number; size: number } {
  const start = chunkNumber * chunkSize;
  const end = Math.min(start + chunkSize, fileSize);
  const size = end - start;

  return { start, end, size };
}

/**
 * Calculate upload progress percentage
 * @param uploadedChunks - Array of uploaded chunk indices
 * @param totalChunks - Total number of chunks
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(uploadedChunks: number[], totalChunks: number): number {
  return Math.round((uploadedChunks.length / totalChunks) * 100);
}

/**
 * Check if upload is complete
 * @param uploadedChunks - Array of uploaded chunk indices
 * @param totalChunks - Total number of chunks
 * @returns True if all chunks uploaded
 */
export function isUploadComplete(uploadedChunks: number[], totalChunks: number): boolean {
  return uploadedChunks.length === totalChunks;
}

/**
 * Get list of missing chunks
 * @param uploadedChunks - Array of uploaded chunk indices
 * @param totalChunks - Total number of chunks
 * @returns Array of missing chunk indices
 */
export function getMissingChunks(uploadedChunks: number[], totalChunks: number): number[] {
  const missing: number[] = [];

  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedChunks.includes(i)) {
      missing.push(i);
    }
  }

  return missing;
}

/**
 * Handle upload errors with user-friendly messages
 * @param error - Error object
 * @param context - Error context
 * @returns User-friendly error message
 */
export function handleUploadError(error: unknown, context: string): string {
  console.error(`${context} 错误:`, error);

  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return '网络连接失败，请检查网络状态';
    }

    if (error.message.includes('timeout')) {
      return '请求超时，请重试';
    }

    if (error.message.includes('500')) {
      return '服务器内部错误，请稍后重试';
    }

    if (error.message.includes('400')) {
      return '请求参数错误';
    }

    return error.message;
  }

  return `${context}时发生未知错误`;
}

/**
 * Validate file type
 * @param file - File object
 * @param allowedTypes - Array of allowed file types
 * @returns Error message or null if valid
 */
export function validateFileType(file: File, allowedTypes?: string[]): string | null {
  if (!allowedTypes || allowedTypes.length === 0) {
    return null;
  }

  const fileType = file.type || '';
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

  const isTypeAllowed = allowedTypes.some((type) => {
    if (type.includes('/')) {
      return fileType === type || fileType.startsWith(type.replace('*', ''));
    } else {
      return fileExtension === type.toLowerCase().replace('.', '');
    }
  });

  return isTypeAllowed ? null : `不支持的文件类型。支持的类型: ${allowedTypes.join(', ')}`;
}

/**
 * Validate file size
 * @param file - File object
 * @param maxSize - Maximum file size in bytes
 * @returns Error message or null if valid
 */
export function validateFileSize(file: File, maxSize?: number): string | null {
  if (!maxSize) {
    return null;
  }

  return file.size <= maxSize
    ? null
    : `文件过大。最大允许: ${formatFileSize(maxSize)}，当前: ${formatFileSize(file.size)}`;
}

/**
 * Validate file comprehensively
 * @param file - File object
 * @param options - Validation options
 * @returns Error message or null if valid
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {},
): string | null {
  const sizeError = validateFileSize(file, options.maxSize);
  if (sizeError) return sizeError;

  const typeError = validateFileType(file, options.allowedTypes);
  if (typeError) return typeError;

  return null;
}

/**
 * Default upload configuration
 */
export const DEFAULT_UPLOAD_CONFIG = {
  chunkSize: 2 * 1024 * 1024, // 2MB
  hashChunkSize: 5 * 1024 * 1024, // 5MB
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000, // 60s
  maxFileSize: 100 * 1024 * 1024, // 100MB
} as const;
