/**
 * 文件存在性检查响应
 */
export interface FileExistsResponse {
  exists: boolean;
  fileUrl?: string;
}

/**
 * 分块上传响应
 */
export interface ChunkUploadResponse {
  success: boolean;
  message: string;
  isComplete?: boolean;
  fileUrl?: string;
}

/**
 * 分块信息响应
 */
export interface ChunkInfoResponse {
  uploadedChunks: number[];
  totalChunks: number;
  isComplete: boolean;
}

/**
 * 完成上传响应
 */
export interface CompleteUploadResponse {
  success: boolean;
  fileUrl: string;
  fileHash?: string;
  message: string;
}

/**
 * 上传进度信息
 */
export interface UploadProgressInfo {
  chunkNumber: number;
  totalChunks: number;
  bytesUploaded: number;
  totalBytes: number;
  speed?: number;
  remainingTime?: number;
}

/**
 * 图片上传返回的 data 结构
 */
export interface UploadImageData {
  fileUrl: string;
  fileHash: string;
  processedFileName: string;
  originalMimeType: string;
  processedMimeType: string;
  imageKitFileId: string;
}
