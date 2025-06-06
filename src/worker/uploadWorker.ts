import { uploadService } from '@/services/upload';

/**
 * 高性能分块上传 Worker
 * 使用已封装的 uploadService，支持断点续传、并发上传和实时进度报告
 */

interface UploadMessage {
  type: 'start';
  file: File;
  fileId: string;
  fileName: string;
  fileHash: string;
  chunkSize: number;
  uploadedChunks?: number[];
  maxConcurrency?: number; // 最大并发数
}

interface ProgressMessage {
  type: 'progress';
  chunkNumber: number;
  totalChunks: number;
  bytesUploaded: number;
  totalBytes: number;
  uploadedChunks: number[];
  speed?: number;
}

interface CompleteMessage {
  type: 'complete';
  fileUrl: string;
}

interface ErrorMessage {
  type: 'error';
  error: string;
  chunkNumber?: number;
}

interface ChunkUploadResult {
  success: boolean;
  isComplete?: boolean;
  fileUrl?: string;
  message?: string;
}

const DEFAULT_MAX_CONCURRENCY = 3; // 默认最大并发数
const MAX_RETRIES = 3; // 每个分块的最大重试次数

/**
 * 上传单个分块 - 使用封装好的 uploadService
 */
async function uploadChunk(
  chunk: Blob,
  fileId: string,
  chunkNumber: number,
  totalChunks: number,
  fileName: string,
  totalSize: number,
  mimeType: string,
  fileHash: string,
  retries: number = 0,
): Promise<ChunkUploadResult> {
  try {
    const result = await uploadService.uploadChunk(
      chunk,
      fileId,
      chunkNumber,
      totalChunks,
      fileName,
      totalSize,
      mimeType,
      fileHash,
      chunk.size, // chunkSize
    );

    return {
      success: result.success || false,
      isComplete: result.isComplete || false,
      fileUrl: result.fileUrl || '',
      message: result.message || '上传成功',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '分块上传失败';

    // 如果还有重试机会，则重试
    if (retries < MAX_RETRIES) {
      console.log(`分块 ${chunkNumber} 上传失败，第 ${retries + 1} 次重试...`);
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000)); // 指数退避

      return uploadChunk(
        chunk,
        fileId,
        chunkNumber,
        totalChunks,
        fileName,
        totalSize,
        mimeType,
        fileHash,
        retries + 1,
      );
    }

    throw new Error(`分块 ${chunkNumber} 上传失败 (已重试 ${MAX_RETRIES} 次): ${errorMessage}`);
  }
}

/**
 * 并发上传分块
 */
async function uploadChunksConcurrently(
  file: File,
  fileId: string,
  fileName: string,
  fileHash: string,
  chunkSize: number,
  uploadedChunks: number[],
  maxConcurrency: number,
): Promise<string | void> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const mimeType = file.type || 'application/octet-stream';

  // 待上传的分块
  const chunksToUpload: number[] = [];

  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedChunks.includes(i)) {
      chunksToUpload.push(i);
    }
  }

  let completedChunks = [...uploadedChunks];
  let uploadedBytes = 0;

  // 计算已上传的字节数
  for (const chunkNum of uploadedChunks) {
    const start = chunkNum * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    uploadedBytes += end - start;
  }

  // 进度报告函数
  const reportProgress = () => {
    self.postMessage({
      type: 'progress',
      chunkNumber: completedChunks.length - 1,
      totalChunks,
      bytesUploaded: uploadedBytes,
      totalBytes: file.size,
      uploadedChunks: [...completedChunks],
    } as ProgressMessage);
  };

  // 初始进度报告
  reportProgress();

  // 并发上传控制
  let activeUploads = 0;
  let hasError = false;

  const uploadPromises = chunksToUpload.map(async (chunkNumber) => {
    // 等待信号量
    while (activeUploads >= maxConcurrency && !hasError) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (hasError) return;

    activeUploads++;

    try {
      const start = chunkNumber * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      if (chunk.size <= 0) {
        activeUploads--;

        return;
      }

      const result = await uploadChunk(
        chunk,
        fileId,
        chunkNumber,
        totalChunks,
        fileName,
        file.size,
        mimeType,
        fileHash,
      );

      // 更新进度
      completedChunks.push(chunkNumber);
      uploadedBytes += chunk.size;

      // 报告进度
      reportProgress();

      // 如果服务端返回完成状态
      if (result.isComplete && result.fileUrl) {
        return result.fileUrl;
      }
    } catch (error) {
      hasError = true;
      throw error;
    } finally {
      activeUploads--;
    }
  });

  // 等待所有上传完成
  try {
    const results = await Promise.all(uploadPromises);

    // 检查是否有分块上传时就完成了
    const earlyComplete = results.find((result) => typeof result === 'string' && result);

    if (earlyComplete) {
      return earlyComplete;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * 主 Worker 消息处理
 */
self.onmessage = async (e: MessageEvent<UploadMessage>) => {
  const {
    file,
    fileId,
    fileName,
    fileHash,
    chunkSize,
    uploadedChunks = [],
    maxConcurrency = DEFAULT_MAX_CONCURRENCY,
  } = e.data;

  try {
    // 验证输入
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象');
    }

    if (!fileId || !fileName || !fileHash) {
      throw new Error('缺少必要的文件信息');
    }

    if (!chunkSize || chunkSize <= 0) {
      throw new Error('无效的分块大小');
    }

    console.log(`开始上传文件: ${fileName}, 大小: ${file.size} bytes, 分块大小: ${chunkSize}`);

    // 执行并发分块上传
    const earlyCompleteUrl = await uploadChunksConcurrently(
      file,
      fileId,
      fileName,
      fileHash,
      chunkSize,
      uploadedChunks,
      maxConcurrency,
    );

    // 如果在分块上传过程中就完成了
    if (earlyCompleteUrl) {
      self.postMessage({
        type: 'complete',
        fileUrl: earlyCompleteUrl,
      } as CompleteMessage);

      return;
    }

    // 所有分块上传完成，请求合并 - 使用 uploadService
    console.log('所有分块上传完成，开始合并文件...');

    const completeResult = await uploadService.completeUpload(
      fileId,
      fileName,
      Math.ceil(file.size / chunkSize),
      fileHash,
      file.size,
      file.type || 'application/octet-stream',
    );

    if (!completeResult.success || !completeResult.fileUrl) {
      throw new Error(completeResult.message || '文件合并失败');
    }

    self.postMessage({
      type: 'complete',
      fileUrl: completeResult.fileUrl,
    } as CompleteMessage);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传过程中发生未知错误';
    console.error('Upload worker error:', errorMessage);

    self.postMessage({
      type: 'error',
      error: errorMessage,
    } as ErrorMessage);
  }
};

/**
 * Worker 错误处理
 */
self.onerror = (error) => {
  self.postMessage({
    type: 'error',
    error: `Worker 执行错误: ${error instanceof ErrorEvent ? error.message : 'Unknown worker error'}`,
  } as ErrorMessage);
};

// 导出类型（用于类型检查）
export type { UploadMessage, ProgressMessage, CompleteMessage, ErrorMessage };
